import {inject, intercept} from '@loopback/context';
import {Filter} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {MONGO_ID_REGEX} from '../models';
import {ProjectManagementService} from '../services';

import {AnyObject} from '@loopback/repository';
import {
  AddNewJobRequestDTO,
  BlockCheckResult,
  BuildingProjectDTO,
  BuildingProjectFilter,
  BuildingProjectInvoiceFilter,
  BuildingProjectTSItemLaboratoryConcreteRequestDTO,
  BuildingProjectTSItemLaboratoryElectrictyRequestDTO,
  BuildingProjectTSItemLaboratoryPolystyreneRequestDTO,
  BuildingProjectTSItemLaboratoryTensileRequestDTO,
  BuildingProjectTSItemLaboratoryWeldingRequestDTO,
  BuildingProjectTSItemUnitInfoRequestDTO,
  BuildingProjectTSItemUnitInfosRequestDTO,
  BuildingProjectsDTO,
  EnumConditionMode,
  EnumConditionModeValues,
  UpdateInvoiceRequestDTO,
} from '../dto';
import {
  EnumRoles,
  KeycloakSecurity,
  KeycloakSecurityProvider,
  protect,
} from '../lib-keycloak/src';

const BASE_ADDR = '/projects/management';
const tags = ['Projects.Management'];

@intercept(protect(EnumRoles.PROJECTS_SERVICE_MANAGER))
export class ProjectManagementController {
  constructor(
    @inject(ProjectManagementService.BINDING_KEY)
    private projectManagementService: ProjectManagementService,
    @inject(KeycloakSecurityProvider.BINDING_KEY)
    private keycloakSecurity: KeycloakSecurity,
  ) {}

  @get(`${BASE_ADDR}/project/{project_id}/details`, {
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
    @param.path.string('project_id') projectId: string,
  ): Promise<BuildingProjectDTO> {
    const {sub: userId} = await this.keycloakSecurity.getUserInfo();
    return this.projectManagementService.getProjectDetailsById(
      userId,
      projectId,
      {
        checkUserAccess: false,
        checkOfficeMembership: false,
      },
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

  @post(`${BASE_ADDR}/{project_id}/technical-spec/laboratory/concrete`, {
    tags,
    summary: 'Add technical specification data (Laboratory / Concrete)',
    description: 'Add technical specification data (Laboratory / Concrete)',
    responses: {204: {}},
  })
  async addTechnicalSpecificationLaboratoryConcreteData(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(
            BuildingProjectTSItemLaboratoryConcreteRequestDTO,
          ),
        },
      },
    })
    body: BuildingProjectTSItemLaboratoryConcreteRequestDTO,
    @param.path.string('project_id', {schema: {pattern: MONGO_ID_REGEX.source}})
    projectId: string,
  ): Promise<void> {
    const {sub: userId} = await this.keycloakSecurity.getUserInfo();
    return this.projectManagementService.addTechnicalSpecLaboratoryConcrete(
      userId,
      projectId,
      body,
      {checkOfficeMembership: false},
    );
  }

  @post(`${BASE_ADDR}/{project_id}/technical-spec/laboratory/tensile`, {
    tags,
    summary: 'Add technical specification data (Laboratory / Tensile)',
    description: 'Add technical specification data (Laboratory, Tensile)',
    responses: {204: {}},
  })
  async addTechnicalSpecificationLaboratoryTensileData(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(
            BuildingProjectTSItemLaboratoryTensileRequestDTO,
          ),
        },
      },
    })
    body: BuildingProjectTSItemLaboratoryTensileRequestDTO,
    @param.path.string('project_id', {schema: {pattern: MONGO_ID_REGEX.source}})
    projectId: string,
  ): Promise<void> {
    const {sub: userId} = await this.keycloakSecurity.getUserInfo();
    return this.projectManagementService.addTechnicalSpecLaboratoryTensile(
      userId,
      projectId,
      body,
      {checkOfficeMembership: false},
    );
  }

  @post(`${BASE_ADDR}/{project_id}/technical-spec/laboratory/welding`, {
    tags,
    summary: 'Add technical specification data (Laboratory / Welding)',
    description: 'Add technical specification data (Laboratory, Welding)',
    responses: {204: {}},
  })
  async addTechnicalSpecificationLaboratoryWeldingData(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(
            BuildingProjectTSItemLaboratoryWeldingRequestDTO,
          ),
        },
      },
    })
    body: BuildingProjectTSItemLaboratoryWeldingRequestDTO,
    @param.path.string('project_id', {schema: {pattern: MONGO_ID_REGEX.source}})
    projectId: string,
  ): Promise<void> {
    const {sub: userId} = await this.keycloakSecurity.getUserInfo();
    return this.projectManagementService.addTechnicalSpecLaboratoryWelding(
      userId,
      projectId,
      body,
      {checkOfficeMembership: false},
    );
  }

  @post(`${BASE_ADDR}/{project_id}/technical-spec/laboratory/polystyrene`, {
    tags,
    summary: 'Add technical specification data (Laboratory / Polystyrene)',
    description: 'Add technical specification data (Laboratory, Polystyrene)',
    responses: {204: {}},
  })
  async addTechnicalSpecificationLaboratoryPolystyreneData(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(
            BuildingProjectTSItemLaboratoryPolystyreneRequestDTO,
          ),
        },
      },
    })
    body: BuildingProjectTSItemLaboratoryPolystyreneRequestDTO,
    @param.path.string('project_id', {schema: {pattern: MONGO_ID_REGEX.source}})
    projectId: string,
  ): Promise<void> {
    const {sub: userId} = await this.keycloakSecurity.getUserInfo();
    return this.projectManagementService.addTechnicalSpecLaboratoryPolystyrene(
      userId,
      projectId,
      body,
      {checkOfficeMembership: false},
    );
  }

  @post(`${BASE_ADDR}/{project_id}/technical-spec/laboratory/electricity`, {
    tags,
    summary: 'Add technical specification data (Laboratory / Electricty)',
    description: 'Add technical specification data (Laboratory, Electricty)',
    responses: {204: {}},
  })
  async addTechnicalSpecificationLaboratoryElectrictyData(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(
            BuildingProjectTSItemLaboratoryElectrictyRequestDTO,
          ),
        },
      },
    })
    body: BuildingProjectTSItemLaboratoryElectrictyRequestDTO,
    @param.path.string('project_id', {schema: {pattern: MONGO_ID_REGEX.source}})
    projectId: string,
  ): Promise<void> {
    const {sub: userId} = await this.keycloakSecurity.getUserInfo();
    return this.projectManagementService.addTechnicalSpecLaboratoryElectricty(
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

  @post(`${BASE_ADDR}/{project_id}/engineers/auto-assign/{field_id}`, {
    tags,
    summary: 'Auto assign an engineer',
    description: 'Auto assign an engineer (of specified field) to the project',
    responses: {204: {}},
  })
  async autoAssignEngineer(
    @param.path.string('project_id', {schema: {pattern: MONGO_ID_REGEX.source}})
    projectId: string,
    @param.path.string('field_id') fieldId: string,
  ): Promise<void> {
    const {sub: userId} = await this.keycloakSecurity.getUserInfo();
    return this.projectManagementService.autoAssignEngineerToProject(
      userId,
      projectId,
      fieldId,
    );
  }

  @get(`${BASE_ADDR}/invoices-list`, {
    tags,
    summary: 'Get all invioces of projects',
    description: 'Get all invioces of projects',
    responses: {
      200: {
        content: {
          'application/json': {
            schema: {
              type: 'array',
              // USE DTO
              items: getModelSchemaRef(Object),
            },
          },
        },
      },
    },
  })
  getAllInvoice(
    @param.filter(BuildingProjectInvoiceFilter)
    filter: Filter<BuildingProjectInvoiceFilter> = {},
  ): Promise<AnyObject[]> {
    return this.projectManagementService.getAllInvoices(undefined, filter);
  }

  @patch(`${BASE_ADDR}/{project_id}/invoices/{invoice_id}`, {
    tags,
    summary: 'Update an invoice',
    description: 'Update an invoice',
    responses: {204: {}},
  })
  async updateInvoice(
    @requestBody() body: UpdateInvoiceRequestDTO,
    @param.path.string('project_id') projectId: string,
    @param.path.string('invoice_id') invoiceId: string,
  ): Promise<void> {
    const {sub: userId} = await this.keycloakSecurity.getUserInfo();
    await this.projectManagementService.updateProjectInvoice(
      userId,
      projectId,
      invoiceId,
      new UpdateInvoiceRequestDTO(body),
    );
  }

  @post(`${BASE_ADDR}/{project_id}/jobs`, {
    tags,
    summary: 'Update an invoice',
    description: 'Update an invoice',
    responses: {204: {}},
  })
  async addNewJob(
    @requestBody() body: AddNewJobRequestDTO,
    @param.path.string('project_id') projectId: string,
  ): Promise<void> {
    const {sub: userId} = await this.keycloakSecurity.getUserInfo();
    await this.projectManagementService.addNewJob(userId, projectId, body);
  }

  @patch(`${BASE_ADDR}/{project_id}/update-building-group-condition`, {
    tags,
    summary: "Update project's Building group condition",
    description: "Update project's Building group condition",
    responses: {204: {}},
  })
  async updateBuildingGroupCondition(
    @param.path.string('project_id') projectId: string,
  ): Promise<void> {
    const {sub: userId} = await this.keycloakSecurity.getUserInfo();
    await this.projectManagementService.updateProjectBuildingGroupCondition(
      userId,
      projectId,
    );
  }

  @get(`${BASE_ADDR}/{project_id}/check-building-group-condition`, {
    tags,
    summary: "Check project's Building group condition",
    description: "Check project's Building group condition",
    responses: {
      200: {
        content: {
          'application/json': {schema: getModelSchemaRef(BlockCheckResult)},
        },
      },
    },
  })
  checkBuildingGroupCondition(
    @param.path.string('project_id') projectId: string,
    @param.query.number('check_mode', {
      schema: {type: 'number', enum: EnumConditionModeValues},
    })
    mode = EnumConditionMode.CHECK_ENGINEERS,
  ): Promise<BlockCheckResult> {
    return this.projectManagementService.checkBuildingGroupConditionByProjectId(
      projectId,
      mode,
      [],
    );
  }
}
