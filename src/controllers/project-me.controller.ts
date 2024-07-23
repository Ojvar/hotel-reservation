import {inject} from '@loopback/context';
import {ProjectManagementService} from '../services';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {
  BuildingProjectDTO,
  BuildingProjectFilter,
  BuildingProjectsDTO,
} from '../dto';
import {KeycloakSecurity, KeycloakSecurityProvider} from '../lib-keycloak/src';
import {Filter} from '@loopback/repository';

const BASE_ADDR = '/offices/me/projects';
const tags = ['Offices.Me.Projects'];

export class ProjectMeController {
  constructor(
    @inject(ProjectManagementService.BINDING_KEY)
    private projectManagementService: ProjectManagementService,
    @inject(KeycloakSecurityProvider.BINDING_KEY)
    private keycloakSecurity: KeycloakSecurity,
  ) {}

  @get(`${BASE_ADDR}`, {
    tags,
    summary: "Get current user's assigned office projects list",
    description: "Get current user's assigned office projects list",
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
  async getProjects(
    @param.filter(BuildingProjectFilter) filter?: Filter<BuildingProjectFilter>,
  ): Promise<BuildingProjectsDTO> {
    const {sub: userId} = await this.keycloakSecurity.getUserInfo();
    return this.projectManagementService.getUserOfficeProjects(userId, filter);
  }
}
