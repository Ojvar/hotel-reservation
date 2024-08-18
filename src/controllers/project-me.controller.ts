/* eslint-disable @typescript-eslint/naming-convention */
import {inject} from '@loopback/context';
import {ProjectManagementService} from '../services';
import {
  get,
  getModelSchemaRef,
  param,
  patch,
  requestBody,
} from '@loopback/rest';
import {
  BuildingProjectDTO,
  BuildingProjectFilter,
  BuildingProjectsDTO,
  SignFilesRequestDTO,
} from '../dto';
import {Filter} from '@loopback/repository';
import {KeycloakSecurity, KeycloakSecurityProvider} from '../lib-keycloak/src';
import {MONGO_ID_REGEX} from '../models';

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
    filter: Filter<BuildingProjectFilter> = {limit: 100, skip: 0, where: {}},
  ): Promise<BuildingProjectsDTO> {
    const {sub: userId} = await this.keycloakSecurity.getUserInfo();
    return this.projectManagementService.getProjectsList({
      ...filter,
      where: {...filter.where, user_id: userId},
    });
  }

  @patch(`${BASE_ADDR}/{project_id}/sign/{file_id}`, {
    tags,
    summary: 'Sign a file',
    description: 'Sign a file',
    responses: {204: {}},
  })
  async signFile(
    @requestBody() body: SignFilesRequestDTO,
    @param.path.string('project_id', {
      schema: {pattern: MONGO_ID_REGEX.source},
    })
    projectId: string,
  ): Promise<void> {
    const {sub: userId} = await this.keycloakSecurity.getUserInfo();
    return this.projectManagementService.signFile(
      userId,
      userId,
      projectId,
      body,
    );
  }
}
