import {inject, intercept} from '@loopback/context';
import {AnyObject, Filter} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {
  AddNewJobRequestDTO,
  BuildingProjectAttachmentDTO,
  BuildingProjectAttachmentsDTO,
  BuildingProjectDTO,
  BuildingProjectInvoiceFilter,
  BuildingProjectRegistrationCodeDTO,
  BuildingProjectStaffItemDTO,
  BuildingProjectStaffItemsDTO,
  BuildingProjectTSItemLaboratoryConcreteRequestDTO,
  BuildingProjectTSItemLaboratoryElectrictyRequestDTO,
  BuildingProjectTSItemLaboratoryPolystyreneRequestDTO,
  BuildingProjectTSItemLaboratoryTensileRequestDTO,
  BuildingProjectTSItemLaboratoryWeldingRequestDTO,
  BuildingProjectTSItemUnitInfoRequestDTO,
  BuildingProjectTSItemUnitInfosRequestDTO,
  DocumentValidationResultDTO,
  FileTokenRequestDTO,
  NewBuildingProjectRequestDTO,
  NewProjectStaffRequestDTO,
  ProjectCommitAttachmentRequestDTO,
  ProjectSummaryEngineerDTO,
  SetBuildingProjectStaffResponseDTO,
  UpdateInvoiceRequestDTO,
  ValidateFormNumberResultDTO,
} from '../dto';
import {FileTokenResponse} from '../lib-file-service/src';
import {
  EnumRoles,
  KeycloakSecurity,
  KeycloakSecurityProvider,
  protect,
} from '../lib-keycloak/src';
import {EnumStatus, MONGO_ID_REGEX} from '../models';
import {
  ProjectManagementService,
  RegistrationOrg,
  RegistrationOrgProvider,
} from '../services';

const BASE_ADDR = '/projects/operators/{office_id}';
const tags = ['Projects.Operators'];

@intercept(protect(EnumRoles.NO_BODY))
export class ProjectOperatorsController {
  constructor(
    @inject(ProjectManagementService.BINDING_KEY)
    private projectManagementService: ProjectManagementService,
    @inject(KeycloakSecurityProvider.BINDING_KEY)
    private keycloakSecurity: KeycloakSecurity,
    @inject(RegistrationOrgProvider.BINDING_KEY)
    private registrationOrg: RegistrationOrg,
  ) {}

  /// INFO: PROJECT ACCESS LEVEL CHECK - APPLIED
  @post(`${BASE_ADDR}/file-token`, {
    tags,
    summary: 'Generate file-upload token',
    description: 'Generate a file-upload token',
    responses: {
      200: {
        description: 'Get an upload file token',
        content: {
          'application/json': {schema: getModelSchemaRef(FileTokenResponse)},
        },
      },
    },
  })
  async getFileToken(
    @requestBody() body: FileTokenRequestDTO,
    @param.path.string('office_id', {schema: {pattern: MONGO_ID_REGEX.source}})
    officeId: string,
  ): Promise<FileTokenResponse> {
    const {sub: userId} = await this.keycloakSecurity.getUserInfo();
    return this.projectManagementService.getFileToken(
      userId,
      officeId,
      userId,
      body.allowed_files ?? [],
    );
  }

  /// INFO: PROJECT ACCESS LEVEL CHECK - APPLIED
  @get(`${BASE_ADDR}/project/verification-code/{n_id}`, {
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
    @param.path.string('office_id', {schema: {pattern: MONGO_ID_REGEX.source}})
    officeId: string,
    @param.path.string('n_id') nId: string,
    @param.query.string('lawyer_nid')
    lawyerNId = '',
  ): Promise<BuildingProjectRegistrationCodeDTO> {
    const {sub: userId} = await this.keycloakSecurity.getUserInfo();
    return this.projectManagementService.sendProjectRegistrationCode(
      userId,
      officeId,
      nId,
      lawyerNId,
    );
  }

  @post(`${BASE_ADDR}/project/{n_id}/{verification_code}`, {
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
    @param.path.string('office_id', {schema: {pattern: MONGO_ID_REGEX.source}})
    officeId: string,
    @param.path.string('n_id') nId: string,
    @param.path.string('verification_code') verificationCode: number,
  ): Promise<BuildingProjectDTO> {
    const {sub: userId} = await this.keycloakSecurity.getUserInfo();
    return this.projectManagementService.createProject(
      userId,
      officeId,
      nId,
      verificationCode,
      new NewBuildingProjectRequestDTO(body),
      {checkOfficeId: true},
    );
  }

  /// INFO: PROJECT ACCESS LEVEL CHECK - APPLIED
  @patch(`${BASE_ADDR}/project/{project_id}`, {
    tags,
    summary: 'Update project',
    description: 'Update project',
    responses: {
      200: {
        content: {
          'application/json': {schema: getModelSchemaRef(BuildingProjectDTO)},
        },
      },
    },
  })
  async updateProject(
    @requestBody() body: NewBuildingProjectRequestDTO,
    @param.path.string('project_id', {schema: {pattern: MONGO_ID_REGEX.source}})
    projectId: string,
  ): Promise<BuildingProjectDTO> {
    const {sub: userId} = await this.keycloakSecurity.getUserInfo();
    return this.projectManagementService.updateProject(
      userId,
      projectId,
      new NewBuildingProjectRequestDTO(body),
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

  @patch(`${BASE_ADDR}/{project_id}/attachments/commit`, {
    tags,
    summary: 'Save uploaded files',
    description: 'Save uploaded files',
    responses: {204: {}},
  })
  async saveAttachments(
    @param.path.string('office_id') _officeId: string,
    @param.path.string('project_id') projectId: string,
    @param.header.string('file-token') fileToken = '',
    @requestBody() body: ProjectCommitAttachmentRequestDTO,
  ): Promise<void> {
    const {sub: userId} = await this.keycloakSecurity.getUserInfo();
    return this.projectManagementService.commitUploadedFiles(
      userId,
      projectId,
      fileToken,
      body.comments ?? {},
    );
  }

  @del(`${BASE_ADDR}/{project_id}/files/{file_id}`, {
    tags,
    summary: 'Remove an uploaed file',
    description: 'Remove an uploaed file',
    responses: {204: {}},
  })
  async removeUploadedFile(
    @param.path.string('project_id', {schema: {pattern: MONGO_ID_REGEX.source}})
    projectId: string,
    @param.path.string('file_id', {
      schema: {pattern: MONGO_ID_REGEX.source},
    })
    fileId: string,
  ) {
    const {sub: userId} = await this.keycloakSecurity.getUserInfo();
    await this.projectManagementService.removeUploadedFile(
      userId,
      projectId,
      fileId,
    );
  }

  @get(`${BASE_ADDR}/{project_id}/files`, {
    tags,
    summary: 'Get projects uploaded files',
    description: 'Get projects uploaded files',
    responses: {
      200: {
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(BuildingProjectAttachmentDTO),
            },
          },
        },
      },
    },
  })
  async getUploadedFiles(
    @param.path.string('project_id') projectId: string,
  ): Promise<BuildingProjectAttachmentsDTO> {
    const {sub: userId} = await this.keycloakSecurity.getUserInfo();
    return this.projectManagementService.getFilesList(userId, projectId, {
      checkOfficeMembership: true,
      checkUserAccess: false,
    });
  }

  @get(`${BASE_ADDR}/{project_id}`, {
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
    @param.path.string('project_id') id: string,
  ): Promise<BuildingProjectDTO> {
    const {sub: userId} = await this.keycloakSecurity.getUserInfo();
    return this.projectManagementService.getProjectDetailsById(userId, id, {
      checkUserAccess: false,
      checkOfficeMembership: true,
    });
  }

  @get(`${BASE_ADDR}/{project_id}/staff`, {
    tags,
    summary: 'Get staff list',
    description: 'Get staff list',
    responses: {
      200: {
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(BuildingProjectStaffItemDTO),
            },
          },
        },
      },
    },
  })
  async getStaffList(
    @param.path.string('project_id') id: string,
  ): Promise<BuildingProjectStaffItemsDTO> {
    const {sub: userId} = await this.keycloakSecurity.getUserInfo();
    return this.projectManagementService.getProjectStaffList(
      userId,
      id,
      [EnumStatus.ACTIVE, EnumStatus.PENDING],
      {checkOfficeMembership: true, checkUserAccess: false},
    );
  }

  @post(`${BASE_ADDR}/{project_id}/staff`, {
    tags,
    summary: 'Add new staff',
    description: 'Add new staff',
    responses: {204: {}},
  })
  async addStaff(
    @requestBody() body: NewProjectStaffRequestDTO,
    @param.path.string('project_id') projectId: string,
  ): Promise<void> {
    const {sub: userId} = await this.keycloakSecurity.getUserInfo();
    return this.projectManagementService.addProjectStaff(
      userId,
      projectId,
      new NewProjectStaffRequestDTO(body),
    );
  }

  @patch(`${BASE_ADDR}/{project_id}/state/commit`, {
    tags,
    summary: 'Commit project state',
    description: 'Commit project state',
    responses: {204: {}},
  })
  async commitProjectState(
    @param.path.string('office_id') _officeId: string,
    @param.path.string('project_id', {schema: {pattern: MONGO_ID_REGEX.source}})
    projectId: string,
  ): Promise<void> {
    const {sub: userId} = await this.keycloakSecurity.getUserInfo();
    await this.projectManagementService.commitState(userId, projectId);
  }

  @patch(`${BASE_ADDR}/{project_id}/staff/{staff_id}/response`, {
    tags,
    summary: 'Set staff response (operator level)',
    description: 'Set staff response (operator level)',
    responses: {204: {}},
  })
  async setStaffResponse(
    @requestBody() body: SetBuildingProjectStaffResponseDTO,
    @param.path.string('project_id', {schema: {pattern: MONGO_ID_REGEX.source}})
    projectId: string,
    @param.path.string('staff_id', {
      schema: {pattern: MONGO_ID_REGEX.source},
    })
    staffId: string,
  ): Promise<void> {
    const {sub: userId} = await this.keycloakSecurity.getUserInfo();
    return this.projectManagementService.setStaffResponse(
      userId,
      projectId,
      staffId,
      body,
      false,
    );
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
      checkOfficeMembership: true,
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
      {checkOfficeMembership: true},
    );
  }

  @get(`${BASE_ADDR}/documents/{document_no}/{auth_pwd}`, {
    tags,
    summary: 'Get document validation result',
    description: 'Get document validation result',
    responses: {
      200: {
        content: {
          'application/json': {
            schema: getModelSchemaRef(DocumentValidationResultDTO),
          },
        },
      },
    },
  })
  getDocumentRegistrationDetailOfLawyers(
    @param.path.string('document_no') documentNo: string,
    @param.path.string('auth_pwd') authPwd: string,
  ): Promise<AnyObject> {
    return this.registrationOrg.documentVerification(documentNo, authPwd);
  }

  @get(`${BASE_ADDR}/validation/{n_id}/{form_no}`, {
    tags,
    summary: "Validating project's form number",
    description: "Validating project's form number",
    responses: {
      200: {
        content: {
          'application/json': {
            schema: getModelSchemaRef(ValidateFormNumberResultDTO),
          },
        },
      },
    },
  })
  validateFormNumber(
    @param.path.string('n_id') nId: string,
    @param.path.string('form_no') formNo: string,
  ): Promise<ValidateFormNumberResultDTO> {
    return this.projectManagementService.validateFormNumber(nId, formNo);
  }

  @post(`${BASE_ADDR}/{project_id}/technical-spec/unit-info`, {
    tags,
    summary: 'Add technical specification data (Unit info)',
    description: 'Add technical specification data (Unit info)',
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
      {checkOfficeMembership: true},
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
      {checkOfficeMembership: true},
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
      {checkOfficeMembership: true},
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
      {checkOfficeMembership: true},
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
      {checkOfficeMembership: true},
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
      {checkOfficeMembership: true},
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
      {checkOfficeMembership: true},
    );
  }
}
