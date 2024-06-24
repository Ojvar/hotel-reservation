/* eslint-disable @typescript-eslint/naming-convention */
import {BindingKey, BindingScope, inject, injectable} from '@loopback/core';
import {
  BuildingProjectDTO,
  BuildingProjectFilter,
  BuildingProjectInvoiceDTO,
  BuildingProjectInvoiceFilter,
  BuildingProjectInvoicesDTO,
  BuildingProjectRegistrationCodeDTO,
  BuildingProjectsDTO,
  NewBuildingProjectInvoiceRequestDTO,
  NewBuildingProjectRequestDTO,
} from '../dto';
import {AnyObject, Filter, repository} from '@loopback/repository';
import {BuildingProjectRepository, ProfileRepository} from '../repositories';
import {VeirificationCodeService} from './veirification-code.service';
import {adjustMin, adjustRange} from '../helpers';
import {BuildingProject, EnumStatus} from '../models';
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

  async getAllInvoices(
    projectId: string,
    userFilter: Filter<BuildingProjectInvoiceFilter> = {},
  ): Promise<BuildingProjectInvoicesDTO> {
    const {type: invoiceType, meta: invoiceMeta = {}} = (userFilter.where ??
      {}) as AnyObject;

    const aggregate = [
      {$match: {_id: new ObjectId(projectId)}},
      {$unwind: '$invoices'},
      {
        $match: {
          ...(invoiceType ? {'invoices.type': invoiceType} : {}),
          ...invoiceMeta,
        },
      },
      {$skip: adjustMin(userFilter.skip ?? 0)},
      {$limit: adjustRange(userFilter.limit ?? 100)},
      {
        $group: {
          _id: '$_id',
          id: {$first: '$_id'},
          created: {$first: '$created'},
          updated: {$first: '$updated'},
          status: {$first: '$status'},
          invoices: {$push: '$invoices'},
        },
      },
    ];
    const pointer = await this.projectRepo.execute(
      BuildingProject.modelName,
      'aggregate',
      aggregate,
    );
    const [result] = await pointer.toArray();
    const {invoices = []} = result;
    return invoices?.map(BuildingProjectInvoiceDTO.fromModel) ?? [];
  }
}
