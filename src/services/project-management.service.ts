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
import {BuildingProjectRepository, ProfileRepository} from '../repositories';
import {VeirificationCodeService} from './veirification-code.service';
import {adjustMin, adjustRange} from '../helpers';
import {
  BuildingProject,
  BuildingProjectJobResult,
  EnumStatus,
  ModifyStamp,
} from '../models';
import {ObjectId} from 'bson';

export const ProjectManagementSteps = {
  REGISTRATION: {code: 0, title: 'ثبت پروژه'},
  DESIGNER_SPECIFICATION: {code: 1, title: 'تغیین مهندس طراح'},
};

export enum EnumRegisterProjectType {
  REG_PROJECT = 1,
  REG_DESIGNER = 2,
}

@injectable({scope: BindingScope.TRANSIENT})
export class ProjectManagementService {
  static BINDING_KEY = BindingKey.create<ProjectManagementService>(
    `services.${ProjectManagementService.name}`,
  );

  readonly C_PROJECT_REGISTRATION_TITLE = 'ثبت پروژه';

  constructor(
    @repository(ProfileRepository) private profileRepo: ProfileRepository,
    @repository(BuildingProjectRepository)
    private projectRepo: BuildingProjectRepository,
    @inject(VeirificationCodeService.BINDING_KEY)
    private verificationCodeService: VeirificationCodeService,
  ) {}

  async updateJobData(
    userId: string,
    data: JobCandiateResultDTO,
  ): Promise<void> {
    const project = await this.projectRepo.findById(data.job.meta.id);

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

    await this.projectRepo.update(project);
  }

  async addNewJob(
    userId: string,
    projectId: string,
    data: AddNewJobRequestDTO,
  ): Promise<void> {
    const project = await this.projectRepo.findById(projectId);
    project.addNewJob(userId, data.job_id, data.invoice_id);
    await this.projectRepo.update(project);
  }

  async updateProjectInvoice(
    userId: string,
    projectId: string,
    invoiceId: string,
    body: UpdateInvoiceRequestDTO,
  ): Promise<void> {
    const project = await this.projectRepo.findById(projectId);
    project.updateInvoice(userId, invoiceId, body.toModel());
    await this.projectRepo.update(project);
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
  ): Promise<BuildingProjectDTO> {
    if (verificationCode && nId) {
      await this.verificationCodeService.checkVerificationCodeByNId(
        nId,
        EnumRegisterProjectType.REG_PROJECT,
        verificationCode,
      );
    }

    const newProject = await this.projectRepo.create(data.toModel(userId));

    if (verificationCode && nId) {
      await this.verificationCodeService.removeVerificationCodeByNId(
        nId,
        EnumRegisterProjectType.REG_PROJECT,
      );
    }

    return BuildingProjectDTO.fromModel(newProject);
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
    const result = await this.projectRepo.find(filter);
    return result.map(BuildingProjectDTO.fromModel);
  }

  async addNewInvoice(
    userId: string,
    id: string,
    data: NewBuildingProjectInvoiceRequestDTO,
  ): Promise<void> {
    const project = await this.projectRepo.findById(id);
    project.addInvoice(userId, data.toModel(userId));
    await this.projectRepo.update(project);
  }

  async getInvoiceById(
    projectId: string,
    invoiceId: string,
  ): Promise<BuildingProjectInvoiceDTO> {
    const project = await this.projectRepo.findById(projectId);
    const invoice = project.getInvoiceByIdOrFail(invoiceId);
    return BuildingProjectInvoiceDTO.fromModel(invoice);
  }

  /// TODO: Create DTO
  async getAllInvoices(
    projectId: string | undefined = undefined,
    userFilter: Filter<BuildingProjectInvoiceFilter> = {},
  ): Promise<AnyObject[]> {
    const {tags: invoiceTags} = (userFilter.where ?? {}) as AnyObject;

    const invoicesConditions = {
      ...(invoiceTags ? {'invoices.invoice.tags': {$in: invoiceTags}} : {}),
    };
    const aggregate = [
      {$sort: {_id: 1}},
      {
        $match: {
          status: EnumStatus.ACTIVE,
          ...(projectId ? {_id: new ObjectId(projectId)} : {}),
        },
      },
      {$unwind: {path: '$invoices', preserveNullAndEmptyArrays: true}},
      ...(Object.keys(invoicesConditions).length ? [invoicesConditions] : []),
      {
        $group: {
          _id: '$_id',
          mergedFields: {$mergeObjects: '$$ROOT'},
          all_states: {$push: '$states'},
        },
      },
      {
        $replaceRoot: {
          newRoot: {$mergeObjects: ['$$ROOT', '$mergedFields']},
        },
      },
      {$set: {states: '$all_states'}},
      {$unset: ['all_states', 'mergedFields']},
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
      {$skip: adjustMin(userFilter.skip ?? 0)},
      {$limit: adjustRange(userFilter.limit ?? 100)},
    ];
    const pointer = await this.projectRepo.execute(
      BuildingProject.modelName,
      'aggregate',
      aggregate,
    );
    const result = await pointer.toArray();

    // TODO: MOve this conversion into dto
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
    // return result.map(BuildingProjectInvoicesListDTO.fromModel);
  }
}
