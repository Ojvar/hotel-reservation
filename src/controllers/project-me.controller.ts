/* eslint-disable @typescript-eslint/naming-convention */
import {inject, intercept} from '@loopback/context';
import {AnyObject, Filter} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {
  BuildingProjectDTO,
  BuildingProjectFilter,
  BuildingProjectsDTO,
} from '../dto';
import {
  EnumRoles,
  KeycloakSecurity,
  KeycloakSecurityProvider,
  protect,
} from '../lib-keycloak/src';
import {BuildingGroup, MONGO_ID_REGEX} from '../models';
import {ProjectManagementService} from '../services';

const BASE_ADDR = '/projects/me';
const tags = ['Projects.Me'];

@intercept(protect(EnumRoles.NO_BODY))
export class ProjectMeController {
  constructor(
    @inject(ProjectManagementService.BINDING_KEY)
    private projectManagementService: ProjectManagementService,
    @inject(KeycloakSecurityProvider.BINDING_KEY)
    private keycloakSecurity: KeycloakSecurity,
  ) {}

  @get(`${BASE_ADDR}`, {
    tags,
    summary: "Get user's projects list",
    description: "Get user's projects list",
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
  async getProjectsList(
    @param.filter(BuildingProjectFilter)
    filter: Filter<BuildingProjectFilter> = {},
  ): Promise<BuildingProjectsDTO> {
    const {sub: userId} = await this.keycloakSecurity.getUserInfo();
    filter = {
      limit: 100,
      skip: 0,
      ...filter,
      where: {...filter.where, user_id: userId},
    };
    return this.projectManagementService.getProjectsList(filter, {
      checkUserAccess: true,
      checkOfficeMembership: false,
    });
  }

  @get(`${BASE_ADDR}/{project_id}/new-building-group`, {
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
  async getNewBuildingGroupConditionByProject(
    @param.path.string('project_id', {schema: {pattern: MONGO_ID_REGEX.source}})
    projectId: string,
  ): Promise<AnyObject | null> {
    return this.projectManagementService.getNewBuildingGroupConditionByProject(
      projectId,
    );
  }
}
