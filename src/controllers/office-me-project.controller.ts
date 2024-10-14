import {inject} from '@loopback/context';
import {AnyObject, Filter} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {
  BuildingProjectDTO,
  BuildingProjectFilter,
  BuildingProjectsDTO,
} from '../dto';
import {KeycloakSecurity, KeycloakSecurityProvider} from '../lib-keycloak/src';
import {BuildingGroup, MONGO_ID_REGEX} from '../models';
import {ProjectManagementService} from '../services';

const BASE_ADDR = '/offices/me/projects';
const tags = ['Offices.Me.Projects'];

export class OfficeMeProjectController {
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

  @get(`${BASE_ADDR}/{project_id}/building-group`, {
    tags,
    summary: "Get project's building group conditions",
    description: "Get project's building group conditions",
    responses: {
      200: {
        content: {
          'application/json': {
            schema: getModelSchemaRef(BuildingGroup),
          },
        },
      },
    },
  })
  getBuildingGroupConditionByProject(
    @param.path.string('project_id', {schema: {pattern: MONGO_ID_REGEX.source}})
    projectId: string,
  ): Promise<AnyObject | null> {
    return this.projectManagementService.getBuildingGroupConditionByProject(
      projectId,
    );
  }
}
