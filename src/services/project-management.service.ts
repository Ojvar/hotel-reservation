/* eslint-disable @typescript-eslint/naming-convention */
import {BindingKey, BindingScope, inject, injectable} from '@loopback/core';
import {
  BuildingProjectRegistrationCodeDTO,
  NewBuildingProjectRequestDTO,
} from '../dto';
import {repository} from '@loopback/repository';
import {ProfileRepository, ProjectRepository} from '../repositories';
import {VeirificationCodeService} from './veirification-code.service';

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
    @repository(ProjectRepository) private projectRepo: ProjectRepository,
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
    nId: string,
    verificationCode: number,
    data: NewBuildingProjectRequestDTO,
  ): Promise<unknown> {
    // Check verification code
    await this.verificationCodeService.checkVerificationCodeByNId(
      nId,
      EnumRegisterProjectType.REG_PROJECT,
      verificationCode,
    );

    // try to save data into
    const newProject = await this.projectRepo.create(data.toModel(userId));

    // Remove verification code
    await this.verificationCodeService.removeVerificationCodeByNId(
      nId,
      EnumRegisterProjectType.REG_PROJECT,
    );

    // return ProjectDTO.fromModel(newProject);
    return newProject;
  }
}
