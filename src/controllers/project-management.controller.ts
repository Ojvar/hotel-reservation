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
  BuildingProjectTSItemLaboratoryRequestDTO,
  BuildingProjectTSItemUnitInfoRequestDTO,
  BuildingProjectTSItemUnitInfosRequestDTO,
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
  ): Promise<BuildingProjectDTO> {
    const {sub: userId} = await this.keycloakSecurity.getUserInfo();
    body = new NewBuildingProjectRequestDTO(body);
    return this.projectManagementService.createNewProject(
      userId,
      undefined,
      undefined,
      body,
      {checkOfficeId: false},
    );
  }

  @get(`${BASE_ADDR}/project/{id}/details`, {
    tags,
    summary: 'Get Project details',
    description: 'Get Project details',
    responses: {
      200: {
        content: {
          'application/json': {schema: getModelSchemaRef(BuildingProjectDTO)},
        },
      },
    },
  })
  async getProjectDetails(
    @param.path.string('id') id: string,
  ): Promise<BuildingProjectDTO> {
    const {sub: userId} = await this.keycloakSecurity.getUserInfo();
    return this.projectManagementService.getProjectByUserId(userId, id, {
      checkUserAccess: false,
      checkOfficeMembership: false,
    });
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
    return this.projectManagementService.getProjectsList(filter, {
      checkUserAccess: false,
      checkOfficeMembership: false,
    });
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

  @post(`${BASE_ADDR}/{project_id}/technical-spec/laboratory`, {
    tags,
    summary: 'Add technical specification data (Laboratory)',
    description: 'Add technical specification data (Laboratory)',
    responses: {204: {}},
  })
  async addTechnicalSpecificationLaboratoryData(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(BuildingProjectTSItemLaboratoryRequestDTO),
        },
      },
    })
    body: BuildingProjectTSItemLaboratoryRequestDTO,
    @param.path.string('project_id', {schema: {pattern: MONGO_ID_REGEX.source}})
    projectId: string,
  ): Promise<void> {
    const {sub: userId} = await this.keycloakSecurity.getUserInfo();
    return this.projectManagementService.addTechnicalSpecLaboratory(
      userId,
      projectId,
      body,
      {checkOfficeMembership: false},
    );
  }

  @post(`${BASE_ADDR}/{project_id}/technical-spec/unit-info`, {
    tags,
    summary: 'Add technical specification data',
    description: 'Add technical specification data',
    responses: {204: {}},
  })
  async addTechnicalSpecificationUnitInfoData(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: getModelSchemaRef(BuildingProjectTSItemUnitInfoRequestDTO),
          },
        },
      },
    })
    body: BuildingProjectTSItemUnitInfosRequestDTO,
    @param.path.string('project_id', {schema: {pattern: MONGO_ID_REGEX.source}})
    projectId: string,
  ): Promise<void> {
    const {sub: userId} = await this.keycloakSecurity.getUserInfo();
    return this.projectManagementService.addTechnicalSpecUnitInfoItem(
      userId,
      projectId,
      body,
      {checkOfficeMembership: false},
    );
  }

  @del(`${BASE_ADDR}/{project_id}/technical-spec/{tech_spec_item_id}`, {
    tags,
    summary: 'Remove technical specification data',
    description: 'Remove technical specification data',
    responses: {204: {}},
  })
  async removeTechnicalSpecificationData(
    @param.path.string('project_id', {schema: {pattern: MONGO_ID_REGEX.source}})
    projectId: string,
    @param.path.string('tech_spec_item_id', {
      schema: {pattern: MONGO_ID_REGEX.source},
    })
    techSpecItemId: string,
  ): Promise<void> {
    const {sub: userId} = await this.keycloakSecurity.getUserInfo();
    return this.projectManagementService.removeTechnicalSpecItem(
      userId,
      projectId,
      techSpecItemId,
      {checkOfficeMembership: false},
    );
  }
}
