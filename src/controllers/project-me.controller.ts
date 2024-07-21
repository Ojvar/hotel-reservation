import {inject} from '@loopback/context';
import {ProjectManagementService} from '../services';
import {get, getModelSchemaRef} from '@loopback/rest';
import {BuildingProjectDTO, BuildingProjectsDTO} from '../dto';
import {KeycloakSecurity, KeycloakSecurityProvider} from '../lib-keycloak/src';

const BASE_ADDR = '/projects/me';
const tags = ['Projects.Me'];

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
  async getProjects(): Promise<BuildingProjectsDTO> {
    const {sub: userId} = await this.keycloakSecurity.getUserInfo();
    return this.projectManagementService.getUserOfficeProjects(userId);
  }
}
