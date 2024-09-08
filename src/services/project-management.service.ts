/* eslint-disable @typescript-eslint/naming-convention */
import {BindingKey, BindingScope, inject, injectable} from '@loopback/core';
import {
  AddNewJobRequestDTO,
  BuildingGroupDTO,
  BuildingProjectAttachmentDTO,
  BuildingProjectAttachmentsDTO,
  BuildingProjectAttachmentSingDTO,
  BuildingProjectDTO,
  BuildingProjectFilter,
  BuildingProjectInvoiceDTO,
  BuildingProjectInvoiceFilter,
  BuildingProjectRegistrationCodeDTO,
  BuildingProjectsDTO,
  BuildingProjectStaffItemDTO,
  BuildingProjectStaffItemsDTO,
  JobCandiateResultDTO,
  NewBuildingProjectInvoiceRequestDTO,
  NewBuildingProjectRequestDTO,
  NewProjectStaffRequestDTO,
  SetBuildingProjectStaffResponseDTO,
  SignFilesRequestDTO,
  UpdateInvoiceRequestDTO,
} from '../dto';
import {AnyObject, Filter, repository} from '@loopback/repository';
import {
  BaseDataRepository,
  BuildingGroupRepository,
  BuildingProjectRepository,
  OfficeRepository,
  ProfileRepository,
} from '../repositories';
import {VerificationCodeService} from './verification-code.service';
import {adjustMin, adjustRange, getPersianDateParts} from '../helpers';
import {
  BuildingGroup,
  BuildingProject,
  BuildingProjectAttachmentSing,
  Condition,
  EnumOfficeMemberRole,
  EnumProgressStatus,
  EnumStatus,
  ModifyStamp,
  Office,
  Profile,
} from '../models';
import {ObjectId} from 'bson';
import {HttpErrors} from '@loopback/rest';
import {FileTokenResponse} from '../lib-file-service/src';
import {FileServiceAgentService} from './file-agent.service';
import {BuildingProjectRmqAgentService} from './building-project-rmq-agent.service';
import {PushNotificationAgentService} from './push-notification-agent.service';
import {EnumTargetType} from '../lib-push-notification-service/src';
import lodash from 'lodash';

export const ProjectManagementSteps = {
  REGISTRATION: {code: 0, title: 'ثبت پروژه'},
  DESIGNER_SPECIFICATION: {code: 1, title: 'تغیین مهندس طراح'},
};

export enum EnumRegisterProjectType {
  REG_PROJECT = 1,
  REG_DESIGNER = 2,
}

type FieldMapper = {
  id: string;
  field: string;
};
type FieldMappers = FieldMapper[];

const CATEGORY_LICENSE_TAG = 'LICENSE_TAG';
const MAX_ATTACHMENT_ITEM_COUNT = 4;

@injectable({scope: BindingScope.REQUEST})
export class ProjectManagementService {
  static BINDING_KEY = BindingKey.create<ProjectManagementService>(
    `services.${ProjectManagementService.name}`,
  );

  static readonly ALLOWED_FILES = [
    'STRUCTURE_MAP',
    'STRUCTURE_CALCULATION',
    'ARCHITECTURAL_MAP',
    'ELECTRICAL_MAP',
    'MECHANIC_MAP',
    'AERIAL_MAP',
    'ELEVATOR_MAP',
    'ELEVATOR_CONTRACT',
    'ELEVATOR_DETAILS',
    'BUILDING_SKETCH',
  ]
    .map(item =>
      Array.from(
        {length: MAX_ATTACHMENT_ITEM_COUNT},
        (_, index) => `${item}_${index + 1}`,
      ),
    )
    .flatMap(x => x);

  readonly PROJECT_REGISTRATION_TITLE = 'ثبت پروژه';

  constructor(
    @repository(BaseDataRepository) private basedataRepo: BaseDataRepository,
    @repository(ProfileRepository) private profileRepo: ProfileRepository,
    @repository(OfficeRepository) private officeRepo: OfficeRepository,
    @repository(BuildingGroupRepository)
    private buildingGroupRepo: BuildingGroupRepository,
    @repository(BuildingProjectRepository)
    private buildingProjectRepo: BuildingProjectRepository,
    @inject(BuildingProjectRmqAgentService.BINDING_KEY)
    private buildingProjectRmqAgentService: BuildingProjectRmqAgentService,
    @inject(VerificationCodeService.BINDING_KEY)
    private verificationCodeService: VerificationCodeService,
    @inject(FileServiceAgentService.BINDING_KEY)
    private fileServiceAgent: FileServiceAgentService,
    @inject(PushNotificationAgentService.BINDING_KEY)
    private pushNotifAgent: PushNotificationAgentService,
  ) {}

  async getProjectDetailsById(
    userId: string,
    id: string,
    checkUserAccess = true,
  ): Promise<BuildingProjectDTO> {
    const project = await this.getProjectByUserIdRaw(
      userId,
      id,
      checkUserAccess,
    );
    return BuildingProjectDTO.fromModel(project);
  }

  async createFilesFieldMapper(): Promise<FieldMappers> {
    const basedata = await this.basedataRepo.find({
      where: {
        status: EnumStatus.ACTIVE,
        category: CATEGORY_LICENSE_TAG,
        'meta.file_field': {exists: true},
      } as object,
    });
    return basedata
      .map(item =>
        Array.from({length: MAX_ATTACHMENT_ITEM_COUNT}, (_, index) => ({
          field: `${item.meta?.file_field}_${index + 1}`,
          id: item.getId(),
        })),
      )
      .flatMap(x => x);
  }

  async signFile(
    operatorId: string,
    userId: string,
    projectId: string,
    data: SignFilesRequestDTO,
  ): Promise<void> {
    const project = await this.buildingProjectRepo.findById(projectId);
    const mapper = await this.createFilesFieldMapper();
    project.signAttachments(operatorId, userId, data.files, mapper);
    await this.buildingProjectRepo.update(project);
  }

  async unsignFile(
    operatorId: string,
    projectId: string,
    data: SignFilesRequestDTO,
  ): Promise<void> {
    const project = await this.buildingProjectRepo.findById(projectId);
    data.files.forEach(file => {
      project.unsignAttachment(operatorId, file);
    });
    await this.buildingProjectRepo.update(project);
  }

  async getBuildingGroupConditionByProject(
    userId: string,
    projectId: string,
  ): Promise<BuildingGroupDTO | null> {
    // Find project
    const project = await this.getProjectByUserIdRaw(userId, projectId);
    const conditionsBaseData = await this.basedataRepo.find({
      where: {category: 'BUILDING_GROUP_CONDITIONS'},
    });
    const buildingGroups = await this.buildingGroupRepo.find({
      where: {status: EnumStatus.ACTIVE},
      include: ['buildingGroupCondition'],
    });

    // Filter building group
    const sortFunc = (a: BuildingGroup, b: BuildingGroup) =>
      +b.conditions![0].min - +a.conditions![0].min;
    let queue = buildingGroups
      .filter(bg => bg.parent_id === null)
      .sort(sortFunc);
    let selectedBuildingGroup: BuildingGroup | null = null;
    while (queue.length > 0) {
      const currentBuildingGroup = queue.find(bGroup => {
        const conditions = bGroup.conditions?.map(c => ({
          ...c,
          value:
            conditionsBaseData.find(x => x.id?.toString() === c.key.toString())
              ?.key ?? '',
        }));
        return !conditions?.length
          ? true
          : conditions?.some(cond =>
              new Condition(cond).checkValue(lodash.get(project, cond.value)),
            );
      });
      if (!currentBuildingGroup) {
        break;
      }
      const parent_id = currentBuildingGroup.id?.toString();
      queue = buildingGroups
        .filter(bGroup => parent_id === bGroup.parent_id?.toString())
        .sort(sortFunc);
      selectedBuildingGroup = currentBuildingGroup;
    }

    return selectedBuildingGroup
      ? BuildingGroupDTO.fromModel(selectedBuildingGroup)
      : null;
  }

  async getStaffRequestsListByUserId(
    userId: string,
    userFilter: Filter<BuildingProjectFilter> = {},
    showUsersRequests = true,
  ): Promise<BuildingProjectsDTO> {
    const filter: Filter<BuildingProjectFilter> = {
      limit: adjustRange(userFilter.limit),
      skip: adjustMin(userFilter.skip),
      offset: adjustMin(userFilter.offset),
    };
    const aggregate = this.getProjectsListAggregate(filter, {
      status: EnumStatus.ACTIVE,
      staff: {
        $elemMatch: {
          user_id: userId,
          status: EnumStatus.ACTIVE,
          response: null,
        },
      },
    });
    const pointer = await this.buildingProjectRepo.execute(
      BuildingProject.modelName,
      'aggregate',
      aggregate,
    );
    const projects = await pointer.toArray();
    if (showUsersRequests) {
      for (const project of projects) {
        project.staff = project.staff?.filter(
          (staff: AnyObject) => staff.user_id === userId,
        );
      }
    }
    return projects.map(BuildingProjectDTO.fromModel);
  }

  async setStaffResponse(
    userId: string,
    projectId: string,
    staffId: string,
    data: SetBuildingProjectStaffResponseDTO,
    validateUser: boolean,
  ): Promise<void> {
    const project = await this.buildingProjectRepo.findById(projectId);
    project.setStaffResponse(
      userId,
      staffId,
      data.status,
      data.description,
      validateUser,
    );
    await this.buildingProjectRepo.update(project);

    // Send RMQ Message
    await this.buildingProjectRmqAgentService.publishStaffUpdate(
      project,
      staffId,
    );
  }

  async commitState(
    userId: string,
    id: string,
    state: EnumProgressStatus,
  ): Promise<void> {
    const project = await this.buildingProjectRepo.findById(id, {
      include: ['office'],
    });
    if (!project.office?.checkUserAccess(userId)) {
      throw new HttpErrors.Unauthorized('Insufficent access level');
    }
    project.commitState(userId, state);
    project.updated = new ModifyStamp({by: userId});
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const {office, ...updatedProject} = project;
    await this.buildingProjectRepo.update(new BuildingProject(updatedProject));

    // Send RMQ Message
    await this.buildingProjectRmqAgentService.publishProjectUpdates(project);
  }

  async getProjectStaffList(
    userId: string,
    id: string,
    staffStatuses = [EnumStatus.ACTIVE],
  ): Promise<BuildingProjectStaffItemsDTO> {
    const now = new Date();
    const aggregate = [
      {$match: {_id: new ObjectId(id)}},

      // Office
      {
        $lookup: {
          from: 'offices',
          localField: 'office_id',
          foreignField: '_id',
          as: 'office',
        },
      },
      {$set: {office: {$first: '$office'}}},

      {
        $match: {
          'office.members': {
            $elemMatch: {
              user_id: userId,
              status: {$in: staffStatuses},
              'membership.role': {
                $in: [
                  EnumOfficeMemberRole.OWNER,
                  EnumOfficeMemberRole.SECRETARY,
                  EnumOfficeMemberRole.CO_FOUNDER,
                ],
              },
              'membership.from': {$lte: now},
              $or: [
                {'members.membership.to': {$exists: false}},
                {'members.membership.to': {$gte: now}},
              ],
            },
          },
        },
      },

      // Unwind over staff
      {$unwind: '$staff'},
      {$match: {'staff.status': EnumStatus.ACTIVE}},

      // Lookup over profiles
      {
        $lookup: {
          from: 'profiles',
          localField: 'staff.user_id',
          foreignField: 'user_id',
          as: 'staff.profile',
        },
      },
      // Lookup over basedata
      {
        $lookup: {
          from: 'basedata',
          localField: 'staff.field_id',
          foreignField: '_id',
          as: 'staff.field',
        },
      },
      {
        $set: {
          'staff.field': {$first: '$staff.field.value'},
          'staff.profile': {$first: '$staff.profile'},
        },
      },

      // Group
      {
        $group: {
          _id: '$_id',
          staff: {$push: '$staff'},
          other_fields: {$first: '$$ROOT'},
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ['$other_fields', {id: '$_id', staff: '$staff'}],
          },
        },
      },
    ];

    const pointer = await this.buildingProjectRepo.execute(
      BuildingProject.modelName,
      'aggregate',
      aggregate,
    );
    const project = await pointer.next();
    return !project
      ? []
      : project.staff.map(BuildingProjectStaffItemDTO.fromModel);
  }

  async addProjectStaff(
    userId: string,
    id: string,
    data: NewProjectStaffRequestDTO,
  ): Promise<void> {
    const project = await this.buildingProjectRepo.findById(id);
    project.addStaff(data.toModel(userId));
    project.updated = new ModifyStamp({by: userId});
    await this.buildingProjectRepo.update(project);

    await this.sendEngineerRequestPushNotif(project, data);
  }

  async sendEngineerRequestPushNotif(
    project: BuildingProject,
    data: NewProjectStaffRequestDTO,
  ): Promise<void> {
    // Get users
    const targetsUserId = data.staff.map(x => x.user_id.toString());
    const profiles = await this.profileRepo.find({
      where: {user_id: {inq: targetsUserId}},
    });

    // Send push message
    const msg = `مهندس گرامی
شما به عنوان مهندس طراح در پورژه ${project.case_no.case_no} انتخاب شده اید
لطفا برای تایید/عدم تایید به پورتال خود مراجعه فرمایید`;
    const tags = ['PROJECT_SERVICE', 'STAFF_ASSIGNMENT'];
    const targets = Array.from(new Set(profiles.map(x => x.n_in)));
    const title = 'درخواست همکاری در پروژه';
    await this.pushNotifAgent.publish(
      EnumTargetType.USERS,
      title,
      msg,
      targets,
      tags,
      'https://qeng.ir/wp-content/uploads/2022/03/qeng-logo.png',
      'https://qeng.ir/wp-content/uploads/2022/03/qeng-logo.png',
      'https://qeng.ir',
      true,
    );
  }

  async removeProjectStaff(
    userId: string,
    id: string,
    staffId: string,
  ): Promise<void> {
    const project = await this.buildingProjectRepo.findById(id);
    project.removeStaff(userId, staffId);
    project.updated = new ModifyStamp({by: userId});
    await this.buildingProjectRepo.update(project);
  }

  async removeUploadedFile(
    userId: string,
    projectId: string,
    fileId: string,
  ): Promise<void> {
    const project = await this.buildingProjectRepo.findById(projectId);
    project.removeUploadedFile(userId, fileId);
    project.updated = new ModifyStamp({by: userId});
    await this.buildingProjectRepo.update(project);
  }

  async getFilesList(id: string): Promise<BuildingProjectAttachmentsDTO> {
    const aggregate: AnyObject[] = [
      {$match: {_id: new ObjectId(id)}},

      {$unwind: '$attachments'},
      {$match: {'attachments.status': 6}},

      {
        $unwind: {
          path: '$attachments.signes',
          preserveNullAndEmptyArrays: true,
        },
      },
      {$match: {'attachments.signes.status': {$ne: 7}}},

      {
        $lookup: {
          from: 'profiles',
          localField: 'attachments.signes.user_id',
          foreignField: 'user_id',
          as: 'attachments.signes.profile',
        },
      },
      {
        $set: {
          'attachments.signes.profile': {
            $first: '$attachments.signes.profile',
          },
        },
      },
      //  { $match: { "attachments.signes.profile.user_id": { $exists: true } } },

      {
        $group: {
          _id: '$attachments.id',
          other_fields: {$first: '$attachments'},
          all_signes: {$push: '$attachments.signes'},
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ['$other_fields', {signes: '$all_signes'}],
          },
        },
      },
    ];

    const pointer = await this.buildingProjectRepo.execute(
      BuildingProject.modelName,
      'aggregate',
      aggregate,
    );
    const attachments: AnyObject[] = await pointer.toArray();
    const filesInfo = await this.fileServiceAgent.getFilesInformation(
      attachments.map(x => x.file_id.toString()),
    );

    // Combile files info
    return attachments.map<BuildingProjectAttachmentDTO>(x => {
      const info = filesInfo.find(
        f => f.id.toString() === x.file_id.toString(),
      );

      return new BuildingProjectAttachmentDTO({
        id: x.id,
        created_at: x.created.at,
        file_id: x.file_id,
        mime: info?.mime,
        field: info?.field_name,
        file_name: info?.original_name,
        file_size: info?.size,
        access_url: info?.access_url,
        access_token: info?.access_token,
        signs: x.signes
          .filter((y: AnyObject) => !!y.id)
          .map(
            (s: BuildingProjectAttachmentSing & {profile?: Profile}) =>
              new BuildingProjectAttachmentSingDTO({
                id: s.id,
                created_at: s.created.at,
                updated_at: s.updated.at,
                user_id: s.user_id,
                status: s.status,
                profile: new Profile({
                  user_id: s.profile?.user_id,
                  n_in: s.profile?.n_in,
                  first_name: s.profile?.first_name,
                  last_name: s.profile?.last_name,
                  mobile: s.profile?.mobile,
                }),
              }),
          ),
      });
    });
  }

  // async getFilesList(id: string): Promise<BuildingProjectAttachmentsDTO> {
  //   const project = await this.buildingProjectRepo.findById(id);
  //   const attachments = project.attachments.filter(
  //     a => a.status === EnumStatus.ACTIVE,
  //   );
  //
  //   // Get files info
  //   const filesList = attachments.map(a => a.file_id);
  //   const filesInfo = await this.fileServiceAgent.getFilesInformation(
  //     filesList,
  //   );
  //
  //   // Merge info
  //   const mergedData = attachments.map(a => {
  //     const fileInfo = filesInfo.find(
  //       f => f.id.toString() === a.file_id.toString(),
  //     );
  //     return { ...a, fileInfo } as BuildingProjectAttachmentItem & {
  //       fileInfo: FileInfoDTO | undefined;
  //     };
  //   });
  //
  //   return mergedData.map(BuildingProjectAttachmentDTO.fromModel);
  // }

  async commitUploadedFiles(
    userId: string,
    id: string,
    fileToken: string,
  ): Promise<void> {
    if (!fileToken) {
      return;
    }
    const project = await this.buildingProjectRepo.findById(id);

    // Get uploaded files info
    const attachments = fileToken
      ? await this.fileServiceAgent.getAttachments(userId, fileToken)
      : null;
    const {uploaded_files: uploadedFiles} = attachments ?? {uploaded_files: []};

    // Update project
    const newAttachments = uploadedFiles.map(f => ({
      fileId: f.id,
      field: f.fieldname,
    }));

    project.updateAttachments(userId, newAttachments);
    project.updated = new ModifyStamp({by: userId});
    await this.buildingProjectRepo.update(project);

    // Commit uploaded files
    await this.fileServiceAgent.commit(userId, fileToken);
  }

  async getFileToken(
    allowedUser: string,
    fields: string[] = [],
  ): Promise<FileTokenResponse> {
    const allowedFiles = ProjectManagementService.ALLOWED_FILES.filter(file =>
      fields.includes(file),
    ).map(x => FileServiceAgentService.generateAllowedFile(x));
    if (!allowedFiles.length) {
      throw new HttpErrors.UnprocessableEntity('Invalid field(s)');
    }
    return this.fileServiceAgent.getFileToken(allowedFiles, allowedUser);
  }

  async generateNewCaseNo(prefix: number, separator = '-'): Promise<string> {
    const aggregate = [
      {$match: {'case_no.prefix': prefix}},
      {$group: {_id: null, max_serial: {$max: '$case_no.serial'}}},
    ];
    const pointer = await this.buildingProjectRepo.execute(
      BuildingProject.modelName,
      'aggregate',
      aggregate,
    );

    let {max_serial} = (await pointer.next()) ?? {max_serial: 0};
    max_serial = (max_serial ?? 0) + 1;
    return `${prefix.toString().padStart(2, '0')}${separator}${max_serial}`;
  }

  updateJobData(userId: string, data: JobCandiateResultDTO): Promise<void> {
    return this.buildingProjectRepo.updateJobData(userId, data);
  }

  async addNewJob(
    userId: string,
    projectId: string,
    data: AddNewJobRequestDTO,
  ): Promise<void> {
    return this.buildingProjectRepo.addNewJob(userId, projectId, data);
  }

  async updateProjectInvoice(
    userId: string,
    projectId: string,
    invoiceId: string,
    body: UpdateInvoiceRequestDTO,
  ): Promise<void> {
    const project = await this.buildingProjectRepo.findById(projectId);
    project.updateInvoice(userId, invoiceId, body.toModel());
    await this.buildingProjectRepo.update(project);
  }

  async sendProjectRegistrationCode(
    nId: string,
  ): Promise<BuildingProjectRegistrationCodeDTO> {
    const userProfile = await this.profileRepo.findByNIdOrFail(nId);
    const trackingCode =
      await this.verificationCodeService.generateAndStoreCode(
        this.PROJECT_REGISTRATION_TITLE,
        userProfile,
        EnumRegisterProjectType.REG_PROJECT,
      );
    return new BuildingProjectRegistrationCodeDTO({
      tracking_code: trackingCode,
    });
  }

  async updateProject(
    userId: string,
    id: string,
    data: NewBuildingProjectRequestDTO,
    options: {checkOfficeId: boolean} = {checkOfficeId: true},
    allowedStatus = [EnumProgressStatus.OFFICE_DATA_ENTRY],
  ): Promise<BuildingProjectDTO> {
    /// TODO: Check user membership date
    if (options.checkOfficeId) {
      await this.userIsAllowedToProjectForOffice(
        userId,
        data.office_id,
        [
          EnumOfficeMemberRole.OWNER,
          EnumOfficeMemberRole.SECRETARY,
          EnumOfficeMemberRole.CO_FOUNDER,
        ],
        [EnumStatus.ACTIVE, EnumStatus.SUSPENDED],
      );
    }
    const oldProject = await this.buildingProjectRepo.findById(id);
    if (!allowedStatus.includes(oldProject.progress_status)) {
      throw new HttpErrors.UnprocessableEntity(
        'Invalid project progress status',
      );
    }

    // Get main owner
    const mainOwner = oldProject.ownership.owners.find(x => x.is_delegate);
    const newMainOwner = data.owners.find(x => x.is_delegate);
    if (mainOwner?.user_id !== newMainOwner?.user_id) {
      throw new HttpErrors.UnprocessableEntity("Main owner can't be changed");
    }
    const updatedProject = data.toModel(
      userId,
      new BuildingProject({
        id: oldProject.id,
        created: oldProject.created,
        updated: new ModifyStamp({by: userId}),
        attachments: oldProject.attachments,
        status: oldProject.status,
        case_no: oldProject.case_no,
        progress_status: oldProject.progress_status,
        progress_status_history: oldProject.progress_status_history,
      }),
    );
    await this.buildingProjectRepo.update(updatedProject);
    return BuildingProjectDTO.fromModel(updatedProject);
  }

  async createNewProject(
    userId: string,
    nId: string | undefined,
    verificationCode: number | undefined,
    data: NewBuildingProjectRequestDTO,
    options: {checkOfficeId: boolean} = {checkOfficeId: true},
  ): Promise<BuildingProjectDTO> {
    const shouldVerify = verificationCode && nId;
    if (shouldVerify) {
      await this.verificationCodeService.checkVerificationCodeByNId(
        nId,
        EnumRegisterProjectType.REG_PROJECT,
        verificationCode,
      );
    }

    if (options.checkOfficeId) {
      await this.userIsAllowedToProjectForOffice(
        userId,
        data.office_id,
        [
          EnumOfficeMemberRole.OWNER,
          EnumOfficeMemberRole.SECRETARY,
          EnumOfficeMemberRole.CO_FOUNDER,
        ],
        [EnumStatus.ACTIVE],
      );
    }
    if (!data.case_no) {
      const year = +getPersianDateParts()[0].slice(-2);
      data.case_no = await this.generateNewCaseNo(year);
    }
    const newProject = await this.buildingProjectRepo.create(
      data.toModel(userId),
    );
    if (shouldVerify) {
      await this.verificationCodeService.removeVerificationCodeByNId(
        nId,
        EnumRegisterProjectType.REG_PROJECT,
      );
    }

    return BuildingProjectDTO.fromModel(newProject);
  }

  async userIsAllowedToProjectForOffice(
    userId: string,
    officeId: string | undefined,
    allowedRoles: EnumOfficeMemberRole[],
    allowedStatus: EnumStatus[],
  ): Promise<void> {
    if (!officeId) {
      throw new HttpErrors.UnprocessableEntity('Invalid Office Id');
    }
    const offices = await this.officeRepo.getOfficesByUserMembership(
      userId,
      allowedRoles,
    );
    const office = offices?.find(currentOffice => {
      return (
        currentOffice.id?.toString() === officeId.toString() &&
        allowedStatus.includes(currentOffice.status)
      );
    });
    if (!office?.getMemberDataByUserId(userId)) {
      throw new HttpErrors.NotAcceptable('User access denined to the office');
    }
  }

  getProjectsListByUserId(
    userId: string,
    filter: Filter<BuildingProjectFilter> = {},
  ): Promise<BuildingProjectsDTO> {
    filter.where = {
      ...filter.where,
      status: EnumStatus.ACTIVE,
      staff: {
        elemMatch: {
          user_id: userId,
          status: EnumStatus.ACTIVE,
          'response.status': EnumStatus.ACCEPTED,
        },
      },
    } as object;
    return this.getProjectsList(filter);
  }

  async getProjectsList(
    filter: Filter<BuildingProjectFilter> = {},
  ): Promise<BuildingProjectsDTO> {
    const {user_id = ''} = (filter.where ?? {}) as AnyObject;
    const aggregate = this.getProjectsListAggregate(filter, {
      staff: {
        $elemMatch: {
          status: EnumStatus.ACTIVE,
          user_id,
          'response.status': EnumStatus.ACCEPTED,
        },
      },
    });
    const pointer = await this.buildingProjectRepo.execute(
      BuildingProject.modelName,
      'aggregate',
      aggregate,
    );
    const projects = await pointer.toArray();
    return projects
      .map((p: AnyObject) => new BuildingProject(p))
      .map(BuildingProjectDTO.fromModel);
  }

  async getProjectByUserIdRaw(
    userId: string,
    id: string,
    checkUserAccess = true,
  ): Promise<BuildingProject> {
    const now = new Date();
    const aggregate = [
      {$match: {_id: new ObjectId(id)}},

      // Check user access
      {
        $lookup: {
          from: 'offices',
          localField: 'office_id',
          foreignField: '_id',
          as: 'office',
        },
      },
      {$set: {office: {$first: '$office'}}},
      {$unwind: '$office.members'},
      ...(checkUserAccess
        ? [
            {
              $match: {
                'office.members.user_id': userId,
                'office.members.status': EnumStatus.ACTIVE,
                'office.members.membership.from': {$lte: new Date()},
                $or: [
                  {'members.membership.to': {$exists: false}},
                  {'members.membership.to': {$gte: now}},
                ],
                'office.members.membership.role': {
                  $in: [
                    EnumOfficeMemberRole.OWNER,
                    EnumOfficeMemberRole.SECRETARY,
                    EnumOfficeMemberRole.CO_FOUNDER,
                  ],
                },
              },
            },
          ]
        : []),
      {$unset: ['office']},

      // Get profiles
      {$unwind: {path: '$lawyers', preserveNullAndEmptyArrays: true}},
      {
        $unwind: {
          path: '$ownership.owners',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'profiles',
          localField: 'lawyers.user_id',
          foreignField: 'user_id',
          as: 'lawyers.profile',
        },
      },
      {
        $lookup: {
          from: 'profiles',
          localField: 'ownership.owners.user_id',
          foreignField: 'user_id',
          as: 'ownership.owners.profile',
        },
      },
      {
        $set: {
          'ownership.owners.profile': {$first: '$ownership.owners.profile'},
          'lawyers.profile': {$first: '$lawyers.profile'},
        },
      },

      {
        $group: {
          _id: '$_id',
          owners: {$push: '$ownership.owners'},
          lawyers: {$push: '$lawyers'},
          other_fields: {$first: '$$ROOT'},
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              '$other_fields',
              {
                ownership: '$ownership',
                lawyers: '$lawyers',
                owners: '$owners',
              },
            ],
          },
        },
      },
      {$set: {'ownership.owners': '$owners', id: '$_id'}},
      {$unset: ['owners']},
    ];
    const pointer = await this.buildingProjectRepo.execute(
      BuildingProject.modelName,
      'aggregate',
      aggregate,
    );
    const project = await pointer.next();
    if (!project) {
      throw new HttpErrors.UnprocessableEntity(
        'Project not found or access was denied',
      );
    }
    return new BuildingProject(project);
  }

  async getProjectByUserId(
    userId: string,
    id: string,
  ): Promise<BuildingProjectDTO> {
    const project = await this.getProjectByUserIdRaw(userId, id);
    return BuildingProjectDTO.fromModel(project);
  }

  async addNewInvoice(
    userId: string,
    id: string,
    data: NewBuildingProjectInvoiceRequestDTO,
  ): Promise<void> {
    const project = await this.buildingProjectRepo.findById(id);
    project.addInvoice(userId, data.toModel(userId));
    await this.buildingProjectRepo.update(project);
  }

  async getInvoiceById(
    projectId: string,
    invoiceId: string,
  ): Promise<BuildingProjectInvoiceDTO> {
    const project = await this.buildingProjectRepo.findById(projectId);
    const invoice = project.getInvoiceByIdOrFail(invoiceId);
    return BuildingProjectInvoiceDTO.fromModel(invoice);
  }

  /// TODO: Create DTO
  async getAllInvoices(
    projectId: string | undefined = undefined,
    userFilter: Filter<BuildingProjectInvoiceFilter> = {},
  ): Promise<AnyObject[]> {
    const {
      tags: invoiceTags,
      job_invoice: jobInvoice,
      job_result: jobResult,
    } = (userFilter.where ?? {}) as AnyObject;

    const invoicesConditions = {
      ...(invoiceTags ? {'invoices.invoice.tags': {$in: invoiceTags}} : {}),
    };
    const jobsCondition: AnyObject = {};
    if (jobResult) {
      jobsCondition['result'] = jobResult;
    }
    if (jobInvoice) {
      jobsCondition['invoice_id'] = new ObjectId(jobInvoice as string);
    }

    const aggregate = [
      {
        $match: {
          status: EnumStatus.ACTIVE,
          ...(projectId ? {_id: new ObjectId(projectId)} : {}),
        },
      },
      {$unwind: {path: '$invoices', preserveNullAndEmptyArrays: true}},
      ...(Object.keys(invoicesConditions).length ? [invoicesConditions] : []),
      ...(Object.keys(jobsCondition).length
        ? [{$match: {jobs: {$elemMatch: jobsCondition}}}]
        : []),
      {
        $group: {
          _id: '$_id',
          mergedFields: {$mergeObjects: '$$ROOT'},
          all_invoices: {$push: '$invoices'},
          all_states: {$push: '$states'},
        },
      },
      {
        $replaceRoot: {
          newRoot: {$mergeObjects: ['$$ROOT', '$mergedFields']},
        },
      },
      {$set: {states: '$all_states', invoices: '$all_invoices'}},
      {$unset: ['all_states', 'all_invoices', 'mergedFields']},
      {
        $lookup: {
          from: 'profiles',
          localField: 'ownership.owners.user_id',
          foreignField: 'user_id',
          as: 'owners_profile',
        },
      },
      {
        $lookup: {
          from: 'profiles',
          localField: 'lawyers.user_id',
          foreignField: 'user_id',
          as: 'lawyers_profile',
        },
      },
      {
        $lookup: {
          from: 'basedata',
          localField: 'ownership_type.ownership_type_id',
          foreignField: '_id',
          as: 'ownership_info',
        },
      },
      {$set: {ownership_info: {$first: '$ownership_info'}}},
      {$sort: {_id: 1}},
      {$skip: adjustMin(userFilter.skip ?? 0)},
      {$limit: adjustRange(userFilter.limit ?? 100)},
    ];
    const pointer = await this.buildingProjectRepo.execute(
      BuildingProject.modelName,
      'aggregate',
      aggregate,
    );
    const result = await pointer.toArray();

    const getProfile = (userId: string, profiles: AnyObject[]): AnyObject => {
      const profile = profiles.find(x => x.user_id === userId) ?? {};
      return {
        n_in: profile.n_in,
        first_name: profile.first_name,
        last_name: profile.last_name,
        mobile: profile.mobile,
      };
    };

    const output = result.map((r: AnyObject) => ({
      ...r,
      _id: undefined,
      id: r._id.toString(),
      case_no: r.case_no.case_no,
      ownership: {
        ...r.ownership,
        owners: r.ownership.owners.map((o: AnyObject) => ({
          ...o,
          profile: getProfile(o.user_id, r.owners_profile),
        })),
        lawyers: r.lawyers.map((l: AnyObject) => ({
          ...l,
          profile: getProfile(l.user_id, r.lawyers_profile),
        })),
        ownership_type: {
          ...r.ownership_type,
          ownership_type: r.ownership_info.key,
        },
      },
      owners_profile: undefined,
      lawyers_profile: undefined,
      ownership_info: undefined,
    }));

    return output;
  }

  async getUserOfficeProjects(
    userId: string,
    filter: Filter<BuildingProjectFilter> = {skip: 0, limit: 100, where: {}},
  ): Promise<BuildingProjectsDTO> {
    filter.where = {...filter.where, user_id: userId};
    const aggregate = this.getProjectsListByUserOfficeAggregate(filter);
    console.debug(JSON.stringify(aggregate, null, 1));
    const pointer = await this.officeRepo.execute(
      Office.modelName,
      'aggregate',
      aggregate,
    );
    const projects = await pointer.toArray();
    return projects
      .map((p: AnyObject) => new BuildingProject(p))
      .map(BuildingProjectDTO.fromModel);
  }

  private projectLookupProfileAggregate = [
    // Owners
    {$unwind: '$ownership.owners'},
    {
      $lookup: {
        from: 'profiles',
        localField: 'ownership.owners.user_id',
        foreignField: 'user_id',
        as: 'ownerProfile',
      },
    },
    {$addFields: {'ownership.owners.profile': {$first: '$ownerProfile'}}},
    {$unset: ['ownerProfile']},

    // Lawyers
    {$unwind: {path: '$lawyers', preserveNullAndEmptyArrays: true}},
    {
      $lookup: {
        from: 'profiles',
        localField: 'lawyers.user_id',
        foreignField: 'user_id',
        as: 'lawyerProfile',
      },
    },
    {$addFields: {'lawyers.profile': {$first: '$lawyerProfile'}}},
    {$unset: ['lawyerProfile']},

    // Unwind over staff
    {$unwind: {path: '$staff', preserveNullAndEmptyArrays: true}},
    {
      $match: {
        $or: [
          {staff: {$exists: false}},
          {staff: null},
          {'staff.status': EnumStatus.ACTIVE},
        ],
      },
    },

    // Lookup over profiles
    {
      $lookup: {
        from: 'profiles',
        localField: 'staff.user_id',
        foreignField: 'user_id',
        as: 'staff.profile',
      },
    },
    // Lookup over basedata
    {
      $lookup: {
        from: 'basedata',
        localField: 'staff.field_id',
        foreignField: '_id',
        as: 'staff.field',
      },
    },
    {
      $set: {
        'staff.field': {$first: '$staff.field.value'},
        'staff.profile': {$first: '$staff.profile'},
      },
    },

    // Regroup data
    {
      $group: {
        _id: '$_id',
        all_owners: {$push: '$ownership.owners'},
        all_lawyers: {$push: '$lawyers'},
        all_staff: {$push: '$staff'},
        other_fields: {$first: '$$ROOT'},
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [
            '$other_fields',
            {
              lawyers: '$all_lawyers',
              staff: '$all_staff',
              ownership: {
                $mergeObjects: [
                  '$other_fields.ownership',
                  {owners: '$all_owners'},
                ],
              },
            },
          ],
        },
      },
    },
    {$sort: {_id: -1}},
  ];

  private getProjectsListAggregate(
    filter: Filter<BuildingProjectFilter> = {skip: 0, limit: 100, where: {}},
    matchClause: AnyObject = {},
  ): AnyObject[] {
    const where: AnyObject = filter.where ?? {};
    const status: EnumStatus = where.status ?? EnumStatus.ACTIVE;

    return [
      {$match: {status, ...matchClause}},
      ...this.projectLookupProfileAggregate,
      {$sort: {_id: 1}},
      {$skip: adjustMin(filter.skip ?? 0)},
      {$limit: adjustRange(filter.limit)},
      {$set: {id: '$_id'}},
    ];
  }

  private getProjectsListByUserOfficeAggregate(
    filter: Filter<BuildingProjectFilter> = {skip: 0, limit: 100, where: {}},
    matchClause: AnyObject = {},
  ): AnyObject[] {
    const where: AnyObject = filter.where ?? {};
    const officeId: string = where.office_id ?? '';
    const userId: string = where.user_id ?? '';
    const status: EnumStatus = where.status ?? {$ne: EnumStatus.DEACTIVE};
    const now = new Date();

    return [
      {
        $match: {
          ...(officeId ? {_id: new ObjectId(officeId)} : {}),
          status,
          ...matchClause,
        },
      },

      // Members
      {$unwind: '$members'},
      {
        $match: {
          'members.user_id': userId,
          'members.membership.role': {
            $in: [
              EnumOfficeMemberRole.OWNER,
              EnumOfficeMemberRole.SECRETARY,
              EnumOfficeMemberRole.CO_FOUNDER,
            ],
          },
          'members.status': EnumStatus.ACTIVE,
          'members.membership.status': EnumStatus.ACTIVE,
          'members.membership.from': {$lte: now},
          $or: [
            {'members.membership.to': {$exists: false}},
            {'members.membership.to': {$gte: now}},
          ],
        },
      },

      // Extract Projects
      {
        $lookup: {
          from: 'building_projects',
          localField: '_id',
          foreignField: 'office_id',
          as: 'projects',
        },
      },
      {$unwind: {path: '$projects', preserveNullAndEmptyArrays: true}},
      {$replaceRoot: {newRoot: '$projects'}},
      ...this.projectLookupProfileAggregate,
      {$skip: adjustMin(filter.skip ?? 0)},
      {$limit: adjustRange(filter.limit)},
      {$set: {id: '$_id'}},
    ];
  }
}
