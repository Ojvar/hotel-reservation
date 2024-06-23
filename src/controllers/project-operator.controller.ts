import {inject, intercept} from '@loopback/context';
import {ProjectManagementService} from '../services';
import {get, getModelSchemaRef, param, post, requestBody} from '@loopback/rest';
import {
  BuildingProjectDTO,
  BuildingProjectRegistrationCodeDTO,
  NewBuildingProjectRequestDTO,
  ProjectSummaryEngineerDTO,
} from '../dto';
import {
  EnumRoles,
  KeycloakSecurity,
  KeycloakSecurityProvider,
  protect,
} from '../lib-keycloak/src';

const BASE_ADDR = '/projects/operators';
const tags = ['Projects.Operators'];

@intercept(protect(EnumRoles.PROJECTS_SERVIE_OPERATORS))
export class ProjectOperatorsController {
  constructor(
    @inject(ProjectManagementService.BINDING_KEY)
    private projectMangementService: ProjectManagementService,
    @inject(KeycloakSecurityProvider.BINDING_KEY)
    private keycloakSecurity: KeycloakSecurity,
  ) {}

  @get(`${BASE_ADDR}/projects/verification-code/{n_id}`, {
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
  ): Promise<BuildingProjectRegistrationCodeDTO> {
    return this.projectMangementService.sendProjectRegistrationCode(nId);
  }

  @post(`${BASE_ADDR}/projects/{n_id}/{verification_code}`, {
    tags,
    summary: 'Create a new project',
    description: 'Create a new project',
    responses: {
      200: {
        content: {
          'application/json': {schema: getModelSchemaRef(BuildingProjectDTO)},
        },
      },
    },
  })
  async createNewProject(
    @requestBody() body: NewBuildingProjectRequestDTO,
    @param.path.string('n_id') nId: string,
    @param.path.string('verification_code') verificationCode: number,
  ): Promise<BuildingProjectDTO> {
    const {sub: userId} = await this.keycloakSecurity.getUserInfo();
    body = new NewBuildingProjectRequestDTO(body);
    return this.projectMangementService.createNewProject(
      userId,
      nId,
      verificationCode,
      body,
    );
  }
}
