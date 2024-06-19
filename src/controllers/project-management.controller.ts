import {inject, intercept} from '@loopback/context';
import {ProjectManagementService} from '../services';
import {getModelSchemaRef, param, post, requestBody} from '@loopback/rest';
import {
  NewProjectDTO,
  NewProjectRequestDTO,
  ProjectRegistrationCodeDTO,
  ProjectSummaryEngineerDTO,
} from '../dto';
import {
  EnumRoles,
  KeycloakSecurity,
  KeycloakSecurityProvider,
  protect,
} from '../lib-keycloak/src';

const BASE_ADDR = '/project-management';
const tags = ['ProjectManagement'];

@intercept(protect(EnumRoles.PROJECTS_SERVIE_MANAGER))
export class ProjectManagementController {
  constructor(
    @inject(ProjectManagementService.BINDING_KEY)
    private projectMangementService: ProjectManagementService,
    @inject(KeycloakSecurityProvider.BINDING_KEY)
    private keycloakSecurity: KeycloakSecurity,
  ) {}

  @post(`${BASE_ADDR}/{n_id}`, {
    tags,
    summary: 'Get validation code to registrating new project',
    description: 'Get validation code to registrating new project',
    responses: {
      200: {
        content: {
          'application/json': {
            schema: getModelSchemaRef(ProjectSummaryEngineerDTO),
          },
        },
      },
    },
  })
  async getProjectRegistrationCode(
    @param.path.string('n_id') nId: string,
  ): Promise<ProjectRegistrationCodeDTO> {
    return this.projectMangementService.sendProjectRegistrationCode(nId);
  }

  @post(`${BASE_ADDR}/new-project/{n_id}/{verification_code}`, {
    tags,
    summary: 'Create a new project',
    description: 'Create a new project',
    responses: {
      200: {
        content: {
          'application/json': {
            schema: getModelSchemaRef(NewProjectDTO),
          },
        },
      },
    },
  })
  async createNewProject(
    @requestBody() body: NewProjectRequestDTO,
    @param.path.string('n_id') nId: string,
    @param.path.string('verification_code') verificationCode: number,
  ): Promise<NewProjectDTO | unknown> {
    const {sub: userId} = await this.keycloakSecurity.getUserInfo();
    return this.projectMangementService.createNewProject(
      userId,
      nId,
      verificationCode,
      body,
    );
  }
}
