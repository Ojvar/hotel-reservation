/* eslint-disable @typescript-eslint/naming-convention */
import {BindingKey, BindingScope, inject, injectable} from '@loopback/core';
import {
  AddNewJobRequestDTO,
  BuildingProjectAttachmentDTO,
  BuildingProjectAttachmentsDTO,
  BuildingProjectDTO,
  BuildingProjectFilter,
  BuildingProjectInvoiceDTO,
  BuildingProjectInvoiceFilter,
  BuildingProjectRegistrationCodeDTO,
  BuildingProjectsDTO,
  JobCandiateResultDTO,
  NewBuildingProjectInvoiceRequestDTO,
  NewBuildingProjectRequestDTO,
  UpdateInvoiceRequestDTO,
} from '../dto';
import {AnyObject, Filter, repository} from '@loopback/repository';
import {
  BuildingProjectRepository,
  OfficeRepository,
  ProfileRepository,
} from '../repositories';
import {VerificationCodeService} from './verification-code.service';
import {adjustMin, adjustRange, getPersianDateParts} from '../helpers';
import {
  BuildingProject,
  BuildingProjectAttachmentItem,
  EnumOfficeMemberRole,
  EnumStatus,
  ModifyStamp,
  Office,
} from '../models';
import {ObjectId} from 'bson';
import {HttpErrors} from '@loopback/rest';
import {FileInfoDTO, FileTokenResponse} from '../lib-file-service/src';
import {FileServiceAgentService} from './file-agent.service';

export const ProjectManagementSteps = {
  REGISTRATION: {code: 0, title: 'ثبت پروژه'},
  DESIGNER_SPECIFICATION: {code: 1, title: 'تغیین مهندس طراح'},
};

export enum EnumRegisterProjectType {
  REG_PROJECT = 1,
  REG_DESIGNER = 2,
}

@injectable({scope: BindingScope.REQUEST})
export class ProjectManagementService {
  static BINDING_KEY = BindingKey.create<ProjectManagementService>(
    `services.${ProjectManagementService.name}`,
  );

  static ALLOWED_FILES = [
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
    .map(item => Array.from({length: 4}, (_, index) => `${item}_${index + 1}`))
    .flatMap(x => x);

  readonly C_PROJECT_REGISTRATION_TITLE = 'ثبت پروژه';

  constructor(
    @repository(ProfileRepository) private profileRepo: ProfileRepository,
    @repository(OfficeRepository) private officeRepo: OfficeRepository,
    @repository(BuildingProjectRepository)
    private buildingProjectRepo: BuildingProjectRepository,
    @inject(VerificationCodeService.BINDING_KEY)
    private verificationCodeService: VerificationCodeService,
    @inject(FileServiceAgentService.BINDING_KEY)
    private fileServiceAgent: FileServiceAgentService,
  ) {}

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
    const project = await this.buildingProjectRepo.findById(id);
    const attachments = project.attachments.filter(
      a => a.status === EnumStatus.ACTIVE,
    );

    // Get files info
    const filesList = attachments.map(a => a.file_id);
    const filesInfo =
      await this.fileServiceAgent.getFilesInformation(filesList);

    // Merge info
    const mergedData = attachments.map(a => {
      const fileInfo = filesInfo.find(
        f => f.id.toString() === a.file_id.toString(),
      );
      return {...a, fileInfo} as BuildingProjectAttachmentItem & {
        fileInfo: FileInfoDTO | undefined;
      };
    });

    return mergedData.map(BuildingProjectAttachmentDTO.fromModel);
  }

  async commitUploadedFiles(
    userId: string,
    id: string,
    fileToken: string,
  ): Promise<void> {
    if (!fileToken) {
      return;
    }

    // Get uploaded files info
    const attachments = fileToken
      ? await this.fileServiceAgent.getAttachments(userId, fileToken)
      : null;
    const {uploaded_files: uploadedFiles} = attachments ?? {uploaded_files: []};

    // Update project
    const project = await this.buildingProjectRepo.findById(id);
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
      {$match: {'case_no_new.prefix': prefix}},
      {$group: {_id: null, max_serial: {$max: '$case_no_new.serial'}}},
    ];
    const pointer = await this.buildingProjectRepo.execute(
      BuildingProject.modelName,
      'aggregate',
      aggregate,
    );
    let {max_serial} = await pointer.next();
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
        this.C_PROJECT_REGISTRATION_TITLE,
        userProfile,
        EnumRegisterProjectType.REG_PROJECT,
      );
    return new BuildingProjectRegistrationCodeDTO({
      tracking_code: trackingCode,
    });
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
      await this.userIsAllowedToProjectForOffice(userId, data.office_id, [
        EnumOfficeMemberRole.OWNER,
        EnumOfficeMemberRole.SECRETARY,
        EnumOfficeMemberRole.CO_FOUNDER,
      ]);
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
  ): Promise<void> {
    if (!officeId) {
      throw new HttpErrors.UnprocessableEntity('Invalid Office Id');
    }

    const offices = await this.officeRepo.getOfficesByUserMembership(
      userId,
      allowedRoles,
    );
    if (!offices) {
      throw new HttpErrors.NotAcceptable('User access denined to the office');
    }
  }

  async getProjectsList(
    filter: Filter<BuildingProjectFilter> = {},
  ): Promise<BuildingProjectsDTO> {
    const aggregate = this.getProjectsListAggregate(filter);
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

  async getProjectByUserId(
    userId: string,
    id: string,
  ): Promise<BuildingProjectDTO> {
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
      {
        $match: {
          'office.members.user_id': userId,
          'office.members.status': EnumStatus.ACTIVE,
          'office.members.membership.from': {$lte: new Date()},
          'office.members.membership.to': {$gte: new Date()},
          'office.members.membership.role': {
            $in: [
              EnumOfficeMemberRole.OWNER,
              EnumOfficeMemberRole.SECRETARY,
              EnumOfficeMemberRole.CO_FOUNDER,
            ],
          },
        },
      },
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
    return BuildingProjectDTO.fromModel(new BuildingProject(project));
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
    {
      $addFields: {
        'ownership.owners.profile': {$first: '$ownerProfile'},
      },
    },
    {$unset: ['ownerProfile']},

    // Lawyers
    {$unwind: '$lawyers'},
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

    // Regroup data
    {
      $group: {
        _id: '$_id',
        all_owners: {$push: '$ownership.owners'},
        all_lawyers: {$push: '$lawyers'},
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
  ];

  getProjectsListAggregate(
    filter: Filter<BuildingProjectFilter> = {skip: 0, limit: 100, where: {}},
  ): AnyObject[] {
    const where: AnyObject = filter.where ?? {};
    const status: EnumStatus = where.status ?? EnumStatus.ACTIVE;

    return [
      {$match: {status}},
      ...this.projectLookupProfileAggregate,
      {$sort: {'projects._id': 1}},
      {$skip: adjustMin(filter.skip ?? 0)},
      {$limit: adjustRange(filter.limit)},
      {$set: {id: '$_id'}},
    ];
  }

  getProjectsListByUserOfficeAggregate(
    filter: Filter<BuildingProjectFilter> = {skip: 0, limit: 100, where: {}},
  ): AnyObject[] {
    const where: AnyObject = filter.where ?? {};
    const officeId: string = where.office_id ?? '';
    const userId: string = where.user_id ?? '';
    const status: EnumStatus = where.status ?? EnumStatus.ACTIVE;
    const now = new Date();

    return [
      {
        $match: {
          ...(officeId ? {_id: new ObjectId(officeId)} : {}),
          status,
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
          'members.membership.to': {$gte: now},
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
      {$unwind: '$projects'},
      {$replaceRoot: {newRoot: '$projects'}},

      ...this.projectLookupProfileAggregate,

      {$sort: {'projects._id': 1}},
      {$skip: adjustMin(filter.skip ?? 0)},
      {$limit: adjustRange(filter.limit)},
      {$set: {id: '$_id'}},
    ];
  }
}
