/* eslint-disable @typescript-eslint/naming-convention */
import {BindingKey, BindingScope, inject, injectable} from '@loopback/core';
import {
  AddNewJobRequestDTO,
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
  BuildingProjectJobResult,
  EnumOfficeMemberRole,
  EnumStatus,
  ModifyStamp,
  Office,
} from '../models';
import {ObjectId} from 'bson';
import {HttpErrors} from '@loopback/rest';

export const ProjectManagementSteps = {
  REGISTRATION: {code: 0, title: 'ثبت پروژه'},
  DESIGNER_SPECIFICATION: {code: 1, title: 'تغیین مهندس طراح'},
};

export enum EnumRegisterProjectType {
  REG_PROJECT = 1,
  REG_DESIGNER = 2,
}

@injectable({scope: BindingScope.APPLICATION})
export class ProjectManagementService {
  static BINDING_KEY = BindingKey.create<ProjectManagementService>(
    `services.${ProjectManagementService.name}`,
  );

  readonly C_PROJECT_REGISTRATION_TITLE = 'ثبت پروژه';

  constructor(
    @repository(ProfileRepository) private profileRepo: ProfileRepository,
    @repository(OfficeRepository) private officeRepo: OfficeRepository,
    @repository(BuildingProjectRepository)
    private buildingProjectRepo: BuildingProjectRepository,
    @inject(VerificationCodeService.BINDING_KEY)
    private verificationCodeService: VerificationCodeService,
  ) {}

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

  async updateJobData(
    userId: string,
    data: JobCandiateResultDTO,
  ): Promise<void> {
    const project = await this.buildingProjectRepo.findById(data.job.meta.id);

    const now = new ModifyStamp({by: userId});
    project.updateJobOfFail(
      userId,
      data.job.id,
      new BuildingProjectJobResult({
        created: now,
        updated: now,
        published_at: data.published_at,
        job_id: data.job.id,
        job_status: data.job.status,
        schedule_error: data.schedule.result.meta.error,
        selected_users: data.schedule.result.meta.data?.users,
        schedule_id: data.schedule.id,
        schedule_status: data.schedule.status,
        schedule_created_at: data.schedule.result.created_at,
      }),
    );

    await this.buildingProjectRepo.update(project);
  }

  async addNewJob(
    userId: string,
    projectId: string,
    data: AddNewJobRequestDTO,
  ): Promise<void> {
    const project = await this.buildingProjectRepo.findById(projectId);
    project.addNewJob(userId, data.job_id, data.invoice_id);
    await this.buildingProjectRepo.update(project);
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
    userFilter: Filter<BuildingProjectFilter> = {},
  ): Promise<BuildingProjectsDTO> {
    const where: AnyObject = userFilter.where ?? {};
    const filter: Filter<BuildingProject> = {
      limit: adjustRange(userFilter.limit ?? 100),
      skip: adjustMin(userFilter.skip ?? 0),
      offset: adjustMin(userFilter.offset ?? 0),
      fields: undefined,
      include: undefined,
      where: {
        ...(userFilter.where ?? {}),
        status: where.statue ?? EnumStatus.ACTIVE,
      } as object,
    };
    const result = await this.buildingProjectRepo.find(filter);
    return result.map(BuildingProjectDTO.fromModel);
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

  async getUserOfficeProjects(userId: string): Promise<BuildingProjectsDTO> {
    const now = new Date();
    const aggregate = [
      {$match: {status: EnumStatus.ACTIVE}},
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
      {
        $group: {
          _id: '$_id',
          mergedFields: {$mergeObjects: '$$ROOT'},
          all_members: {$push: '$members'},
        },
      },
      {
        $replaceRoot: {
          newRoot: {$mergeObjects: ['$$ROOT', '$mergedFields']},
        },
      },
      {$set: {members: '$all_members'}},
      {$unset: ['all_members', 'mergedFields']},
    ];

    const pointer = await this.officeRepo.execute(
      Office.modelName,
      'aggregate',
      aggregate,
    );
    const projects = await pointer.toArray();
    return projects.map((p: AnyObject) => new BuildingProject(p));
  }
}
