/* eslint-disable @typescript-eslint/naming-convention */
import {BindingKey, BindingScope, inject, injectable} from '@loopback/core';
import {AnyObject, Filter, repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {ObjectId} from 'bson';
import lodash from 'lodash';
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
  BuildingProjectTSItemLaboratoryConcreteRequestDTO,
  BuildingProjectTSItemLaboratoryElectrictyRequestDTO,
  BuildingProjectTSItemLaboratoryPolystyreneRequestDTO,
  BuildingProjectTSItemLaboratoryTensileRequestDTO,
  BuildingProjectTSItemLaboratoryWeldingRequestDTO,
  BuildingProjectTSItemUnitInfoRequestDTO,
  BuildingProjectTSItemUnitInfosRequestDTO,
  JobCandiateResultDTO,
  NewBuildingProjectInvoiceRequestDTO,
  NewBuildingProjectRequestDTO,
  NewProjectStaffRequestDTO,
  SetBuildingProjectStaffResponseDTO,
  SignFilesRequestDTO,
  SmsMessage,
  UpdateInvoiceRequestDTO,
  ValidateFormNumberResultDTO,
} from '../dto';
import {
  addMonth,
  adjustMin,
  adjustRange,
  getPersianDateParts,
} from '../helpers';
import {FileTokenResponse} from '../lib-file-service/src';
import {EnumTargetType} from '../lib-push-notification-service/src';
import {
  BuildingGroup,
  BuildingProject,
  BuildingProjectAttachmentSing,
  BuildingProjectLawyer,
  BuildingProjectTechSpec,
  Condition,
  EnumBuildingProjectTechSpecItems,
  EnumOfficeMemberRole,
  EnumProgressStatus,
  EnumStatus,
  ModifyStamp,
  Office,
  Profile,
} from '../models';
import {
  BaseDataRepository,
  BuildingGroupRepository,
  BuildingProjectRepository,
  OfficeRepository,
  ProfileRepository,
} from '../repositories';
import {BuildingProjectRmqAgentService} from './building-project-rmq-agent.service';
import {FileServiceAgentService} from './file-agent.service';
import {PushNotificationAgentService} from './push-notification-agent.service';
import {VerificationCodeService} from './verification-code.service';
import {MessageService} from './message.service';

export const ProjectManagementSteps = {
  REGISTRATION: {code: 0, title: 'ثبت پروژه'},
  DESIGNER_SPECIFICATION: {code: 1, title: 'تغیین مهندس طراح'},
};

export enum EnumRegisterProjectType {
  REG_PROJECT = 1,
  REG_DESIGNER = 2,
}

export type CheckOfficeAccessOptions = {
  checkOfficeMembership: boolean;
};
export type CheckProjectDetailsOptions = CheckOfficeAccessOptions & {
  checkUserAccess: boolean;
};

type FieldMapper = {
  id: string;
  field: string;
};
type FieldMappers = FieldMapper[];

const CATEGORY_LICENSE_TAG = 'LICENSE_TAG';

export type ProjectManagementServiceConfig = {
  maxAttachmentsItemCount: number;
  pushNotification: boolean;
  sendSMS: boolean;
  verificationSmsExpireTime: number;
  projectRegistrationTitle: string;
};

@injectable({scope: BindingScope.REQUEST})
export class ProjectManagementService {
  static BINDING_KEY = BindingKey.create<ProjectManagementService>(
    `services.${ProjectManagementService.name}`,
  );
  static CONFIG_BINDING_KEY = BindingKey.create<ProjectManagementServiceConfig>(
    `services.config.${ProjectManagementService.name}`,
  );

  readonly ALLOWED_OFFICE_MEMBERSHIP_RULES = [
    EnumOfficeMemberRole.OWNER,
    EnumOfficeMemberRole.SECRETARY,
    EnumOfficeMemberRole.CO_FOUNDER,
  ];

  readonly ALLOWED_STAFF_STATUS = [EnumStatus.ACCEPTED, EnumStatus.PENDING];

  readonly ALLOWED_FILES = [
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
        {length: this.configs.maxAttachmentsItemCount},
        (_, index) => `${item}_${index + 1}`,
      ),
    )
    .flatMap(x => x);

  constructor(
    @inject(ProjectManagementService.CONFIG_BINDING_KEY)
    private configs: ProjectManagementServiceConfig,
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
    @inject(MessageService.BINDING_KEY)
    private messageService: MessageService,
  ) {}

  async addTechnicalSpecLaboratoryElectricty(
    userId: string,
    projectId: string,
    data: BuildingProjectTSItemLaboratoryElectrictyRequestDTO,
    options: CheckOfficeAccessOptions,
  ): Promise<void> {
    const [project] = await this.checkProjectUserAccessLevel(
      userId,
      projectId,
      {...options, removeRelations: true},
    );

    // Check older and active laboratory record
    const [labItem] = project.getActiveTechnicalItems(
      EnumBuildingProjectTechSpecItems.LABORATORY_ELECTRICITY,
    );
    labItem?.markAsRemoved(userId);

    // Add new item
    const now = new ModifyStamp({by: userId});
    project.addTechnicalSpecItem(userId, [
      new BuildingProjectTechSpec({
        created: now,
        updated: now,
        status: EnumStatus.ACTIVE,
        tags: [EnumBuildingProjectTechSpecItems.LABORATORY_ELECTRICITY],
        data: new BuildingProjectTSItemLaboratoryElectrictyRequestDTO(
          data,
        ).toModel(),
      }),
    ]);
    await this.buildingProjectRepo.update(project);
  }

  async addTechnicalSpecLaboratoryPolystyrene(
    userId: string,
    projectId: string,
    data: BuildingProjectTSItemLaboratoryPolystyreneRequestDTO,
    options: CheckOfficeAccessOptions,
  ): Promise<void> {
    const [project] = await this.checkProjectUserAccessLevel(
      userId,
      projectId,
      {...options, removeRelations: true},
    );

    // Check older and active laboratory record
    const [labItem] = project.getActiveTechnicalItems(
      EnumBuildingProjectTechSpecItems.LABORATORY_POLYSTYRENE,
    );
    labItem?.markAsRemoved(userId);

    // Add new item
    const now = new ModifyStamp({by: userId});
    project.addTechnicalSpecItem(userId, [
      new BuildingProjectTechSpec({
        created: now,
        updated: now,
        status: EnumStatus.ACTIVE,
        tags: [EnumBuildingProjectTechSpecItems.LABORATORY_POLYSTYRENE],
        data: new BuildingProjectTSItemLaboratoryPolystyreneRequestDTO(
          data,
        ).toModel(),
      }),
    ]);
    await this.buildingProjectRepo.update(project);
  }

  async addTechnicalSpecLaboratoryTensile(
    userId: string,
    projectId: string,
    data: BuildingProjectTSItemLaboratoryTensileRequestDTO,
    options: CheckOfficeAccessOptions,
  ): Promise<void> {
    const [project] = await this.checkProjectUserAccessLevel(
      userId,
      projectId,
      {...options, removeRelations: true},
    );

    // Check older and active laboratory record
    const [labItem] = project.getActiveTechnicalItems(
      EnumBuildingProjectTechSpecItems.LABORATORY_TENSILE,
    );
    labItem?.markAsRemoved(userId);

    // Add new item
    const now = new ModifyStamp({by: userId});
    project.addTechnicalSpecItem(userId, [
      new BuildingProjectTechSpec({
        created: now,
        updated: now,
        status: EnumStatus.ACTIVE,
        tags: [EnumBuildingProjectTechSpecItems.LABORATORY_TENSILE],
        data: new BuildingProjectTSItemLaboratoryTensileRequestDTO(
          data,
        ).toModel(),
      }),
    ]);
    await this.buildingProjectRepo.update(project);
  }

  async addTechnicalSpecLaboratoryWelding(
    userId: string,
    projectId: string,
    data: BuildingProjectTSItemLaboratoryWeldingRequestDTO,
    options: CheckOfficeAccessOptions,
  ): Promise<void> {
    const [project] = await this.checkProjectUserAccessLevel(
      userId,
      projectId,
      {...options, removeRelations: true},
    );

    // Check older and active laboratory record
    const [labItem] = project.getActiveTechnicalItems(
      EnumBuildingProjectTechSpecItems.LABORATORY_WELDING,
    );
    labItem?.markAsRemoved(userId);

    // Add new item
    const now = new ModifyStamp({by: userId});
    project.addTechnicalSpecItem(userId, [
      new BuildingProjectTechSpec({
        created: now,
        updated: now,
        status: EnumStatus.ACTIVE,
        tags: [EnumBuildingProjectTechSpecItems.LABORATORY_WELDING],
        data: new BuildingProjectTSItemLaboratoryWeldingRequestDTO(
          data,
        ).toModel(),
      }),
    ]);
    await this.buildingProjectRepo.update(project);
  }

  async addTechnicalSpecLaboratoryConcrete(
    userId: string,
    projectId: string,
    data: BuildingProjectTSItemLaboratoryConcreteRequestDTO,
    options: CheckOfficeAccessOptions,
  ): Promise<void> {
    const [project] = await this.checkProjectUserAccessLevel(
      userId,
      projectId,
      {...options, removeRelations: true},
    );

    // Check older and active laboratory record
    const [labItem] = project.getActiveTechnicalItems(
      EnumBuildingProjectTechSpecItems.LABORATORY_CONCRETE,
    );
    labItem?.markAsRemoved(userId);

    // Add new item
    const now = new ModifyStamp({by: userId});
    project.addTechnicalSpecItem(userId, [
      new BuildingProjectTechSpec({
        created: now,
        updated: now,
        status: EnumStatus.ACTIVE,
        tags: [EnumBuildingProjectTechSpecItems.LABORATORY_CONCRETE],
        data: new BuildingProjectTSItemLaboratoryConcreteRequestDTO(
          data,
        ).toModel(),
      }),
    ]);
    await this.buildingProjectRepo.update(project);
  }

  async addTechnicalSpecUnitInfoItem(
    userId: string,
    projectId: string,
    data: BuildingProjectTSItemUnitInfosRequestDTO,
    options: CheckOfficeAccessOptions,
  ): Promise<void> {
    // Check user access
    const [project] = await this.checkProjectUserAccessLevel(
      userId,
      projectId,
      {
        ...options,
        removeRelations: true,
        allowedOfficeStatus: [EnumStatus.ACTIVE, EnumStatus.SUSPENDED],
        allowedOfficeMembershipRules: this.ALLOWED_OFFICE_MEMBERSHIP_RULES,
      },
    );

    // Add items
    const now = new ModifyStamp({by: userId});
    project.addTechnicalSpecItem(
      userId,
      data.map(
        item =>
          new BuildingProjectTechSpec({
            created: now,
            updated: now,
            status: EnumStatus.ACTIVE,
            tags: [EnumBuildingProjectTechSpecItems.UNIT_INFO],
            data: new BuildingProjectTSItemUnitInfoRequestDTO(item).toModel(),
          }),
      ),
    );
    await this.buildingProjectRepo.update(project);
  }

  async removeTechnicalSpecItem(
    userId: string,
    projectId: string,
    techSpecItemId: string,
    options: CheckOfficeAccessOptions,
  ): Promise<void> {
    const [project] = await this.checkProjectUserAccessLevel(
      userId,
      projectId,
      {
        ...options,
        removeRelations: true,
        allowedOfficeStatus: [EnumStatus.ACTIVE, EnumStatus.SUSPENDED],
        allowedOfficeMembershipRules: this.ALLOWED_OFFICE_MEMBERSHIP_RULES,
      },
    );
    project.removeTechnicalSpecItem(userId, techSpecItemId);
    await this.buildingProjectRepo.update(project);
  }

  async checkAndExpireProjects(
    userId: string,
    projectId?: string,
  ): Promise<void> {
    const expireDate = addMonth(new Date(), -2);
    await this.buildingProjectRepo.execute(
      BuildingProject.modelName,
      'updateAll',

      projectId
        ? {_id: new ObjectId(projectId)}
        : {
            'ownership_type.issue_date': {$lt: expireDate},
            status: EnumStatus.ACTIVE,
            progress_status: EnumProgressStatus.OFFICE_DATA_ENTRY,
          },
      {
        $set: {
          status: EnumStatus.DEACTIVE,
          updated: new ModifyStamp({by: userId}),
        },
      },
    );
  }

  async validateFormNumber(
    nId: string,
    formNo: string,
  ): Promise<ValidateFormNumberResultDTO> {
    const uniqueKey = BuildingProject.generateUniqueKey(nId, formNo);
    const project = await this.buildingProjectRepo.findOne({
      where: {unique_key: uniqueKey, status: {neq: EnumStatus.DEACTIVE}},
    });
    return new ValidateFormNumberResultDTO({
      is_unique: !project,
      unique_key: uniqueKey,
    });
  }

  private async validateFormNumberByProjectData(
    data: NewBuildingProjectRequestDTO,
  ): Promise<string> {
    // We accept just one delegate owner
    const delegateOwners = data.owners.filter(x => !!x.is_delegate);
    const delegateOwner =
      delegateOwners.length !== 1 ? undefined : delegateOwners[0];
    const delegateUserId = delegateOwner?.user_id;
    const delegateProfile =
      delegateUserId &&
      (await this.profileRepo.findOne({
        where: {user_id: delegateUserId},
      }));
    if (!delegateUserId || !delegateProfile) {
      throw new HttpErrors.NotAcceptable(
        'No delegate owner has been specified',
      );
    }
    const {is_unique, unique_key} = await this.validateFormNumber(
      delegateProfile.n_in,
      data.ownership_type.form_number,
    );
    if (!is_unique) {
      throw new HttpErrors.NotAcceptable(
        `Form number and NationaId is already exists`,
      );
    }
    return unique_key;
  }

  async removeProjectStaff(
    userId: string,
    projectId: string,
    staffId: string,
    {checkOfficeMembership}: CheckOfficeAccessOptions,
  ): Promise<void> {
    const project = await this.findActiveProjectOrFail(projectId);
    if (checkOfficeMembership) {
      await this.getOfficeByCheckingPrivileges(
        userId,
        projectId,
        project.office_id.toString(),
      );
    }
    project.removeStaff(userId, staffId);
    await this.buildingProjectRepo.update(project);
  }

  async removeProjectById(
    userId: string,
    projectId: string,
    {checkOfficeMembership}: CheckOfficeAccessOptions,
  ): Promise<void> {
    const project = await this.findActiveProjectOrFail(projectId);
    if (checkOfficeMembership) {
      await this.getOfficeByCheckingPrivileges(
        userId,
        projectId,
        project.office_id.toString(),
      );
    }
    project.markAsRemoved(userId);
    await this.buildingProjectRepo.update(project);
  }

  async getProjectDetailsById(
    userId: string,
    id: string,
    options?: CheckProjectDetailsOptions,
  ): Promise<BuildingProjectDTO> {
    const project = await this.getProjectByUserIdRaw(userId, id, options);
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
        Array.from(
          {length: this.configs.maxAttachmentsItemCount},
          (_, index) => ({
            field: `${item.meta?.file_field}_${index + 1}`,
            id: item.getId(),
          }),
        ),
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
    options?: CheckProjectDetailsOptions,
  ): Promise<BuildingGroupDTO | null> {
    // Find project
    const project = await this.getProjectByUserIdRaw(
      userId,
      projectId,
      options,
    );
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
      staff: {$elemMatch: {user_id: userId, status: EnumStatus.PENDING}},
    });
    const pointer = await this.buildingProjectRepo.execute(
      BuildingProject.modelName,
      'aggregate',
      aggregate,
    );
    const projects = await pointer.toArray();
    if (showUsersRequests) {
      projects.forEach(
        (project: AnyObject) =>
          (project.staff = project.staff?.filter(
            (staff: AnyObject) => staff.user_id === userId,
          )),
      );
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
    const staff = project.setStaffResponse(
      userId,
      staffId,
      data.status,
      data.description,
      validateUser,
    );

    // Sign related attachments
    const staffField = await this.basedataRepo.findById(staff.field_id);
    project.signRelatedFiles(userId, staff.user_id, staffField.key);
    await this.buildingProjectRepo.update(project);

    // Send RMQ Message
    await this.buildingProjectRmqAgentService.publishStaffUpdate(
      project,
      staffId,
    );
  }

  async commitState(
    userId: string,
    projectId: string,
    state: EnumProgressStatus,
  ): Promise<void> {
    const [project] = await this.checkProjectUserAccessLevel(
      userId,
      projectId,
      {removeRelations: true},
    );

    // Update project's state
    project.commitState(userId, state);
    project.updated = new ModifyStamp({by: userId});
    await this.buildingProjectRepo.update(project);

    // Send RMQ Message
    await this.buildingProjectRmqAgentService.publishProjectUpdates(project);
  }

  async getProjectStaffList(
    userId: string,
    projectId: string,
    staffStatuses = [EnumStatus.ACTIVE, EnumStatus.PENDING],
    options: Partial<CheckProjectDetailsOptions> = {},
  ): Promise<BuildingProjectStaffItemsDTO> {
    // Check for super-user access level
    options = {checkUserAccess: true, checkOfficeMembership: false, ...options};
    const [project] = await this.checkProjectUserAccessLevel(
      userId,
      projectId,
      {...options, staffStatuses},
    );

    const aggregate = [
      {$match: {_id: new ObjectId(projectId)}},
      {$unwind: '$staff'},

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
    const projectData = await pointer.next();
    return !project
      ? []
      : projectData.staff.map(BuildingProjectStaffItemDTO.fromModel);
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
    const title = 'سازمان نظام مهندسی ساختمان استان قزوین';
    const msg = `شما به عنوان مهندس در پروژه ${project.case_no.case_no} انتخاب شده اید
لطفا برای تایید/عدم تایید به آدرس زیر مراجعه فرمایید
https://apps.qeng.ir/dashboard
`;
    const tags = ['PROJECT_SERVICE', 'STAFF_ASSIGNMENT'];

    const sendNotif = () => {
      if (!this.configs.pushNotification) {
        return Promise.resolve();
      }
      const targets = Array.from(new Set(profiles.map(x => x.n_in)));
      return this.pushNotifAgent.publish(
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
    };

    const sendMessages = async () => {
      if (!this.configs.sendSMS) {
        return;
      }
      const smsTargets = Array.from(new Set(profiles.map(x => x.mobile)));
      for (const target of smsTargets) {
        await this.messageService.sendSms(
          new SmsMessage({
            sender: 'PROJECT_SERVICE',
            tag: tags.join(','),
            receiver: target,
            body: ['درخواست همکاری در پروژه', msg].join('\n'),
          }),
        );
      }
    };
    await Promise.all([sendNotif(), sendMessages()]);
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

  async getFilesList(
    userId: string,
    projectId: string,
    options: CheckProjectDetailsOptions,
    staffStatuses: EnumStatus[] = [EnumStatus.ACCEPTED, EnumStatus.PENDING],
  ): Promise<BuildingProjectAttachmentsDTO> {
    // Check for super-user access level
    await this.checkProjectUserAccessLevel(userId, projectId, {
      ...options,
      staffStatuses,
    });

    const aggregate: AnyObject[] = [
      {$match: {_id: new ObjectId(projectId)}},
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
          'attachments.signes.profile': {$first: '$attachments.signes.profile'},
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
    operatorId: string,
    officeId: string,
    allowedUser: string,
    fields: string[] = [],
  ): Promise<FileTokenResponse> {
    await this.checkOfficeUserAccessLevel(operatorId, officeId);

    const allowedFiles = this.ALLOWED_FILES.filter(file =>
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
    operatorId: string,
    officeId: string,
    nId: string,
    lawyerNid = '',
  ): Promise<BuildingProjectRegistrationCodeDTO> {
    await this.checkOfficeUserAccessLevel(operatorId, officeId);

    const userProfile = await this.profileRepo.findByNIdOrFail(nId);
    const lawyerProfile = lawyerNid
      ? await this.profileRepo.findByNIdOrFail(lawyerNid)
      : undefined;

    const trackingCode =
      await this.verificationCodeService.generateAndStoreCode(
        this.configs.projectRegistrationTitle,
        userProfile,
        EnumRegisterProjectType.REG_PROJECT,
        this.configs.verificationSmsExpireTime,
        {},
        lawyerProfile,
      );

    return new BuildingProjectRegistrationCodeDTO({
      tracking_code: trackingCode,
    });
  }

  async updateProject(
    userId: string,
    projectId: string,
    data: NewBuildingProjectRequestDTO,
    options: {checkOfficeMembership: boolean} = {checkOfficeMembership: true},
    allowedProjectProgressStatus = [EnumProgressStatus.OFFICE_DATA_ENTRY],
  ): Promise<BuildingProjectDTO> {
    const [oldProject] = await this.checkProjectUserAccessLevel(
      userId,
      projectId,
      {
        ...options,
        removeRelations: true,
        allowedOfficeMembershipRules: this.ALLOWED_OFFICE_MEMBERSHIP_RULES,
        allowedOfficeStatus: [EnumStatus.ACTIVE, EnumStatus.SUSPENDED],
      },
    );

    if (!allowedProjectProgressStatus.includes(oldProject.progress_status)) {
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
    const updatedLawyers = [...(oldProject.lawyers ?? [])].map(
      x => new BuildingProjectLawyer({...x, status: EnumStatus.DEACTIVE}),
    );
    if (data.lawyer) {
      updatedLawyers.push(data.lawyer.toModel(userId));
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
        lawyers: updatedLawyers,
      }),
    );
    await this.buildingProjectRepo.update(updatedProject);
    return BuildingProjectDTO.fromModel(updatedProject);
  }

  async createNewProject(
    userId: string,
    officeId: string,
    nId: string | undefined,
    verificationCode: number | undefined,
    data: NewBuildingProjectRequestDTO,
    options: Partial<{checkOfficeId: boolean}> = {},
  ): Promise<BuildingProjectDTO> {
    options = {checkOfficeId: true, ...options};

    // Check user's office access access
    if (options.checkOfficeId) {
      await this.checkOfficeUserAccessLevel(userId, officeId);
    }

    // Generate and Check project's unique key
    data.unique_key = await this.validateFormNumberByProjectData(data);

    // Check verification code stored in the redis
    const shouldVerify = verificationCode && nId;
    if (shouldVerify) {
      const laywerProfile = data.lawyer
        ? await this.profileRepo.findOne({
            where: {user_id: data.lawyer?.user_id},
          })
        : undefined;
      await this.verificationCodeService.checkVerificationCodeByNId(
        nId,
        EnumRegisterProjectType.REG_PROJECT,
        verificationCode,
        laywerProfile?.n_in,
      );
    }

    if (!data.case_no) {
      const year = +getPersianDateParts()[0].slice(-2);
      data.case_no = await this.generateNewCaseNo(year);
    }

    const newProject = await this.buildingProjectRepo.create(
      data.toModel(userId, {}),
    );

    // Remove verification code stored in the redis
    if (shouldVerify) {
      await this.verificationCodeService.removeVerificationCodeByNId(
        nId,
        EnumRegisterProjectType.REG_PROJECT,
      );
    }

    return BuildingProjectDTO.fromModel(newProject);
  }

  async getProjectsList(
    filter: Filter<BuildingProjectFilter> = {},
    options: Partial<CheckProjectDetailsOptions> = {},
  ): Promise<BuildingProjectsDTO> {
    options = {checkOfficeMembership: false, checkUserAccess: true, ...options};

    const {user_id = ''} = (filter.where ?? {}) as AnyObject;
    const aggregate = this.getProjectsListAggregate(filter, {
      ...(options.checkUserAccess
        ? {
            staff: {
              $elemMatch: {
                status: this.ALLOWED_STAFF_STATUS,
                user_id,
              },
            },
          }
        : {}),
    });
    const pointer = await this.buildingProjectRepo.execute(
      BuildingProject.modelName,
      'aggregate',
      aggregate,
      {allowDiskUse: true},
    );
    const projects = await pointer.toArray();
    return projects
      .map((p: AnyObject) => new BuildingProject(p))
      .map(BuildingProjectDTO.fromModel);
  }

  async getProjectByUserIdRaw(
    userId: string,
    projectId: string,
    options: Partial<CheckProjectDetailsOptions> = {},
  ): Promise<BuildingProject> {
    options = {checkUserAccess: true, checkOfficeMembership: false, ...options};

    await this.checkProjectUserAccessLevel(userId, projectId, {
      ...options,
      removeRelations: true,
    });

    const aggregate = [
      {$match: {_id: new ObjectId(projectId)}},

      // Get profiles
      {$unwind: {path: '$lawyers', preserveNullAndEmptyArrays: true}},
      {$unwind: {path: '$ownership.owners', preserveNullAndEmptyArrays: true}},
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
              {ownership: '$ownership', lawyers: '$lawyers', owners: '$owners'},
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
      {allowDiskUse: true},
    );
    const project = await pointer.next();
    if (!project) {
      throw new HttpErrors.UnprocessableEntity(
        'Project not found or access was denied',
      );
    }
    return new BuildingProject(project);
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
    const jobsCondition: AnyObject = {
      ...(jobResult ? {result: jobResult} : {}),
      ...(jobInvoice ? {invoice_id: new ObjectId(jobInvoice as string)} : {}),
    };
    const customConditions = [
      ...(Object.keys(invoicesConditions).length ? [invoicesConditions] : []),
      ...(Object.keys(jobsCondition).length
        ? [{$match: {jobs: {$elemMatch: jobsCondition}}}]
        : []),
    ];

    const aggregate = [
      {
        $match: projectId
          ? {_id: new ObjectId(projectId)}
          : {status: EnumStatus.ACTIVE},
      },
      {$unwind: {path: '$invoices', preserveNullAndEmptyArrays: true}},
      ...customConditions,

      // Group invoices ans states
      {
        $group: {
          _id: '$_id',
          mergedFields: {$mergeObjects: '$$ROOT'},
          all_invoices: {$push: '$invoices'},
          all_states: {$push: '$states'},
        },
      },
      {$replaceRoot: {newRoot: {$mergeObjects: ['$$ROOT', '$mergedFields']}}},
      {$set: {states: '$all_states', invoices: '$all_invoices'}},
      {$unset: ['all_states', 'all_invoices', 'mergedFields']},

      // Lookup profiles
      {$unwind: '$ownership.owners'},
      {
        $lookup: {
          from: 'profiles',
          localField: 'ownership.owners.user_id',
          foreignField: 'user_id',
          as: 'ownership.owneres.profile',
        },
      },

      // Lookup lawyers
      {$unwind: '$lawyers'},
      {
        $lookup: {
          from: 'profiles',
          localField: 'lawyers.user_id',
          foreignField: 'user_id',
          as: 'lawyers.profile',
        },
      },

      // Regroup data
      {
        $group: {
          _id: '$_id',
          mergedFields: '$$ROOT',
          all_lawyers: {$push: '$lawyers'},
          all_ownerships: {$push: '$ownership'},
        },
      },
      {$replaceRoot: {newRoot: {$mergeObjects: ['$$ROOT', '$mergedFields']}}},
      {$set: {lawyers: '$all_lawyers', ownership: '$all_ownerships'}},
      {$unset: ['all_lawyers', 'all_ownerships', 'mergedFields']},

      // Lookup basedata
      {
        $lookup: {
          from: 'basedata',
          localField: 'ownership_type.ownership_type_id',
          foreignField: '_id',
          as: 'ownership_info',
        },
      },
      {$set: {ownership_info: {$first: '$ownership_info'}}},

      {$sort: {'created.at': 1}},
      {$skip: adjustMin(userFilter.skip ?? 0)},
      {$limit: adjustRange(userFilter.limit ?? 100)},
    ];
    console.debug(JSON.stringify(aggregate, null, 1));
    const pointer = await this.buildingProjectRepo.execute(
      BuildingProject.modelName,
      'aggregate',
      aggregate,
    );
    const result = await pointer.toArray();

    const getProfile = (profile: Profile): AnyObject => ({
      n_in: profile.n_in,
      first_name: profile.first_name,
      last_name: profile.last_name,
      mobile: profile.mobile,
    });

    return result.map((r: AnyObject) => ({
      ...r,
      _id: undefined,
      id: r._id.toString(),
      case_no: r.case_no.case_no,
      ownership: {
        ...r.ownership,
        owners: r.ownership.owners.map((owner: AnyObject) => ({
          ...owner,
          profile: getProfile(owner.profile),
        })),
        lawyers: r.lawyers.map((lawyer: AnyObject) => ({
          ...lawyer,
          profile: getProfile(lawyer.profile),
        })),
        ownership_type: {
          ...r.ownership_type,
          ownership_type: r.ownership_info.key,
        },
      },
    }));
  }

  private async getOfficeByCheckingPrivileges(
    userId: string,
    projectId: string,
    officeId: string,
    allowedRoles = this.ALLOWED_OFFICE_MEMBERSHIP_RULES,
  ) {
    // Check office membership data
    const offices = await this.officeRepo.getOfficesByUserMembership(
      userId,
      allowedRoles,
    );
    const office = offices.find(
      o =>
        officeId === o.id?.toString() &&
        o.members.some(m => m.user_id === userId),
    );
    if (!office) {
      throw new HttpErrors.UnprocessableEntity(
        `Invalid membership access, User id: ${userId}, Project Id: ${projectId}`,
      );
    }
    return office;
  }

  private async findActiveProjectOrFail(
    projectId: string,
  ): Promise<BuildingProject> {
    const project = await this.buildingProjectRepo.findOne({
      where: {id: projectId, status: EnumStatus.ACTIVE},
    });
    if (!project) {
      throw new HttpErrors.NotFound(`Project not found, Id: ${projectId}`);
    }
    return project;
  }

  async getUserOfficeProjects(
    userId: string,
    filter: Filter<BuildingProjectFilter> = {skip: 0, limit: 100, where: {}},
  ): Promise<BuildingProjectsDTO> {
    filter.where = {...filter.where, user_id: userId};
    const aggregate = this.getProjectsListByUserOfficeAggregate(filter);
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
        as: 'ownership.owners.profile',
      },
    },
    {$set: {'ownership.owners.profile': {$first: '$ownership.owners.profile'}}},

    // Lawyers
    {$unwind: {path: '$lawyers', preserveNullAndEmptyArrays: true}},
    {
      $lookup: {
        from: 'profiles',
        localField: 'lawyers.user_id',
        foreignField: 'user_id',
        as: 'lawyers.profile',
      },
    },
    {$set: {'lawyers.profile': {$first: '$lawyers.profile'}}},

    // Unwind over staff
    {$unwind: {path: '$staff', preserveNullAndEmptyArrays: true}},

    //// TODO: [BUG] If there are no any active staff, the project will be ommited from list
    ////   and it isn't correct
    // {
    //   $match: {
    //     $or: [
    //       {staff: {$exists: false}},
    //       {staff: null},
    //       {'staff.status': {$ne: EnumStatus.DEACTIVE}},
    //     ],
    //   },
    // },

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
    {$sort: {'created.at': -1}},
  ];

  private getProjectsListAggregate(
    filter: Filter<BuildingProjectFilter> = {skip: 0, limit: 100, where: {}},
    matchClause: AnyObject = {},
  ): AnyObject[] {
    const {case_no, status = EnumStatus.ACTIVE} = (filter.where ??
      {}) as AnyObject;
    return [
      {
        $match: {
          status,
          ...matchClause,
          ...(case_no ? {'case_no.case_no': case_no} : {}),
        },
      },
      ...this.projectLookupProfileAggregate,
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
            $in: this.ALLOWED_OFFICE_MEMBERSHIP_RULES,
          },
          'members.status': EnumStatus.ACTIVE,
          'members.membership.status': EnumStatus.ACTIVE,
          'members.membership.from': {$lte: now},
          $or: [
            {'members.membership.to': {$exists: false}},
            {'members.membership.to': null},
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
      {$match: {'projects.status': {$ne: EnumStatus.DEACTIVE}}},
      {$unwind: {path: '$projects', preserveNullAndEmptyArrays: true}},
      {$replaceRoot: {newRoot: '$projects'}},
      ...this.projectLookupProfileAggregate,
      {$skip: adjustMin(filter.skip ?? 0)},
      {$limit: adjustRange(filter.limit)},
      {$set: {id: '$_id'}},
    ];
  }

  private async checkOfficeUserAccessLevel(
    userId: string,
    officeId: string,
    accessLevels: EnumOfficeMemberRole[] = this.ALLOWED_OFFICE_MEMBERSHIP_RULES,
  ): Promise<Office> {
    const office = await this.officeRepo.findById(officeId);
    if (!office.checkUserAccess(userId, accessLevels)) {
      throw new HttpErrors.Unauthorized('Insufficent user access level');
    }
    return office;
  }

  private async checkProjectUserAccessLevel(
    userId: string,
    projectId: string,
    options: Partial<
      CheckProjectDetailsOptions & {
        removeRelations: boolean;
        staffStatuses: EnumStatus[];
        allowedOfficeMembershipRules: EnumOfficeMemberRole[];
        allowedOfficeStatus: EnumStatus[];
      }
    > = {},
  ): Promise<[BuildingProject, Partial<CheckProjectDetailsOptions>]> {
    // Create a clone
    options = {
      removeRelations: true,
      staffStatuses: [EnumStatus.ACTIVE, EnumStatus.PENDING],
      allowedOfficeMembershipRules: this.ALLOWED_OFFICE_MEMBERSHIP_RULES,
      allowedOfficeStatus: [EnumStatus.ACCEPTED, EnumStatus.SUSPENDED],
      ...options,
    };

    // Check for super-user access level
    const project = await this.buildingProjectRepo.findById(projectId, {
      include: ['office'],
    });
    if (options.checkOfficeMembership) {
      const isSuperUser = !!project.office?.checkUserAccess(
        userId,
        options.allowedOfficeMembershipRules,
        options.allowedOfficeStatus,
      );
      if (!isSuperUser) {
        throw new HttpErrors.Unauthorized('Insufficient user access level');
      }
      options = {...options, checkUserAccess: false};
    }
    if (options.checkUserAccess) {
      const isAllowed = project.staff?.some(
        staff =>
          staff.user_id === userId &&
          options.staffStatuses?.includes(staff.status),
      );
      if (!isAllowed) {
        throw new HttpErrors.Unauthorized('Insufficient user access level');
      }
    }

    if (options.removeRelations) {
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const {office, ...newProject} = project;
      return [new BuildingProject(newProject), options];
    }
    return [project, options];
  }
}
