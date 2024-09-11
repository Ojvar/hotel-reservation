import {inject, intercept} from '@loopback/context';
import {ProjectManagementService} from '../services';
import {get, getModelSchemaRef, param, post, requestBody} from '@loopback/rest';
import {
  BuildingProjectDTO,
  BuildingProjectFilter,
  BuildingProjectsDTO,
  NewBuildingProjectRequestDTO,
} from '../dto';
import {
  EnumRoles,
  KeycloakSecurity,
  KeycloakSecurityProvider,
  protect,
} from '../lib-keycloak/src';
import {Filter} from '@loopback/repository';

const BASE_ADDR = '/projects/management';
const tags = ['Projects.Management'];

@intercept(protect(EnumRoles.PROJECTS_SERVIE_MANAGER))
export class ProjectManagementController {
  constructor(
    @inject(ProjectManagementService.BINDING_KEY)
    private projectMangementService: ProjectManagementService,
    @inject(KeycloakSecurityProvider.BINDING_KEY)
    private keycloakSecurity: KeycloakSecurity,
  ) {}

  @post(`${BASE_ADDR}/new-project`, {
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
    @param.header.string('file-token') fileToken: string,
  ): Promise<BuildingProjectDTO> {
    const {sub: userId} = await this.keycloakSecurity.getUserInfo();
    body = new NewBuildingProjectRequestDTO(body);
    return this.projectMangementService.createNewProject(
      userId,
      undefined,
      undefined,
      body,
      fileToken,
      {checkOfficeId: false},
    );
  }

  @get(`${BASE_ADDR}`, {
    tags,
    summary: 'Get all projects list',
    description: 'Get all projects list',
    responses: {
      200: {
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(BuildingProjectDTO),
            },
          },
        },
      },
    },
  })
  getProjectsList(
    @param.filter(BuildingProjectFilter)
    filter: Filter<BuildingProjectFilter> = {},
  ): Promise<BuildingProjectsDTO> {
    return this.projectMangementService.getProjectsList(filter);
  }
}
