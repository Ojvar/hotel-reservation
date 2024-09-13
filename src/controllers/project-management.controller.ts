import {inject, intercept} from '@loopback/context';
import {ProjectManagementService} from '../services';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  post,
  requestBody,
} from '@loopback/rest';
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
import {MONGO_ID_REGEX} from '../models';

const BASE_ADDR = '/projects/management';
const tags = ['Projects.Management'];

@intercept(protect(EnumRoles.PROJECTS_SERVIE_MANAGER))
export class ProjectManagementController {
  constructor(
    @inject(ProjectManagementService.BINDING_KEY)
    private projectManagementService: ProjectManagementService,
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
    return this.projectManagementService.createNewProject(
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
    return this.projectManagementService.getProjectsList(filter);
  }

  @del(`${BASE_ADDR}/{project_id}`, {
    tags,
    summary: 'Remove project',
    description: 'Remove project',
    responses: {204: {}},
  })
  async removeProjectById(
    @param.path.string('project_id') projectId: string,
  ): Promise<void> {
    const {sub: userId} = await this.keycloakSecurity.getUserInfo();
    return this.projectManagementService.removeProjectById(userId, projectId, {
      checkOfficeMembership: false,
    });
  }

  @del(`${BASE_ADDR}/{project_id}/staff/{staff_id}`, {
    tags,
    summary: 'Remove staff from a project',
    description: 'Remove staff from a project',
    responses: {204: {}},
  })
  async removeProjectStaffById(
    @param.path.string('project_id', {schema: {pattern: MONGO_ID_REGEX.source}})
    projectId: string,
    @param.path.string('staff_id', {schema: {pattern: MONGO_ID_REGEX.source}})
    staffId: string,
  ): Promise<void> {
    const {sub: userId} = await this.keycloakSecurity.getUserInfo();
    return this.projectManagementService.removeProjectStaff(
      userId,
      projectId,
      staffId,
      {checkOfficeMembership: false},
    );
  }

  @post(`${BASE_ADDR}/batch-updates/expire-projects`, {
    tags,
    summary: 'Check projects stauts to expire them',
    description: 'Check projects stauts to expire them',
    responses: {204: {}},
  })
  async checkAndExpireProjects(
    @param.query.string('project_id') projectId?: string,
  ): Promise<void> {
    const {sub: userId} = await this.keycloakSecurity.getUserInfo();
    return this.projectManagementService.checkAndExpireProjects(
      userId,
      projectId,
    );
  }
}
