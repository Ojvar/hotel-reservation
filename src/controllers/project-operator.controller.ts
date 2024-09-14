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
  DocumentValidationResultDTO,
  FileTokenRequestDTO,
  NewBuildingProjectRequestDTO,
  NewProjectStaffRequestDTO,
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
import {
  EnumProgressStatus,
  EnumProgressStatusValues,
  EnumStatus,
  MONGO_ID_REGEX,
} from '../models';
import {
  ProjectConverterService,
  ProjectManagementService,
  RegistrationOrg,
  RegistrationOrgProvider,
} from '../services';

const BASE_ADDR = '/projects/operators';
const tags = ['Projects.Operators'];

export class ProjectOperatorsController {
  constructor(
    @inject(ProjectManagementService.BINDING_KEY)
    private projectManagementService: ProjectManagementService,
    @inject(KeycloakSecurityProvider.BINDING_KEY)
    private keycloakSecurity: KeycloakSecurity,
    @inject(ProjectConverterService.BINDING_KEY)
    private projectConverterService: ProjectConverterService,
    @inject(RegistrationOrgProvider.BINDING_KEY)
    private registrationOrg: RegistrationOrg,
  ) {}

  @intercept(protect(EnumRoles.PROJECTS_SERVIE_OPERATORS))
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
  ): Promise<FileTokenResponse> {
    const {sub: userId} = await this.keycloakSecurity.getUserInfo();
    return this.projectManagementService.getFileToken(
      userId,
      body.allowed_files ?? [],
    );
  }

  @intercept(
    protect([EnumRoles.PROJECTS_SERVIE_OPERATORS, EnumRoles.READONLY_OPERATOR]),
  )
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
  getProjectRegistrationCode(
    @param.path.string('n_id') nId: string,
    @param.query.string('lawyer_nid')
    lawyerNId = '',
  ): Promise<BuildingProjectRegistrationCodeDTO> {
    return this.projectManagementService.sendProjectRegistrationCode(
      nId,
      lawyerNId,
    );
  }

  @intercept(protect(EnumRoles.PROJECTS_SERVIE_OPERATORS))
  @patch(`${BASE_ADDR}/project/{id}`, {
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
    @param.path.string('id') id: string,
  ): Promise<BuildingProjectDTO> {
    const {sub: userId} = await this.keycloakSecurity.getUserInfo();
    body = new NewBuildingProjectRequestDTO(body);
    return this.projectManagementService.updateProject(userId, id, body);
  }

  @intercept(protect(EnumRoles.PROJECTS_SERVIE_OPERATORS))
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
    @param.path.string('n_id') nId: string,
    @param.path.string('verification_code') verificationCode: number,
  ): Promise<BuildingProjectDTO> {
    const {sub: userId} = await this.keycloakSecurity.getUserInfo();
    return this.projectManagementService.createNewProject(
      userId,
      nId,
      verificationCode,
      new NewBuildingProjectRequestDTO(body),
      {checkOfficeId: true},
    );
  }

  @intercept(protect(EnumRoles.PROJECTS_SERVIE_OPERATORS))
  @post(`${BASE_ADDR}/import/{case_no}`, {
    tags,
    summary: 'Import specified project',
    description: 'Import specified project',
    responses: {
      200: {
        content: {
          'application/json': {schema: getModelSchemaRef(BuildingProjectDTO)},
        },
      },
    },
  })
  async importProject(
    @param.path.string('case_no') caseNo: string,
  ): Promise<BuildingProjectDTO> {
    const {sub: userId} = await this.keycloakSecurity.getUserInfo();
    return this.projectConverterService.importProject(userId, caseNo);
  }

  @intercept(
    protect([EnumRoles.PROJECTS_SERVIE_OPERATORS, EnumRoles.READONLY_OPERATOR]),
  )
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

  @intercept(protect(EnumRoles.PROJECTS_SERVIE_OPERATORS))
  @patch(`${BASE_ADDR}/{id}/invoices/{invoice_id}`, {
    tags,
    summary: 'Update an invoice',
    description: 'Update an invoice',
    responses: {204: {}},
  })
  async updateInvoice(
    @requestBody() body: UpdateInvoiceRequestDTO,
    @param.path.string('id') id: string,
    @param.path.string('invoice_id') invoiceId: string,
  ): Promise<void> {
    const {sub: userId} = await this.keycloakSecurity.getUserInfo();
    await this.projectManagementService.updateProjectInvoice(
      userId,
      id,
      invoiceId,
      new UpdateInvoiceRequestDTO(body),
    );
  }

  @intercept(protect(EnumRoles.PROJECTS_SERVIE_OPERATORS))
  @post(`${BASE_ADDR}/{id}/jobs`, {
    tags,
    summary: 'Update an invoice',
    description: 'Update an invoice',
    responses: {204: {}},
  })
  async addNewJob(
    @requestBody() body: AddNewJobRequestDTO,
    @param.path.string('id') id: string,
  ): Promise<void> {
    const {sub: userId} = await this.keycloakSecurity.getUserInfo();
    await this.projectManagementService.addNewJob(userId, id, body);
  }

  @intercept(protect(EnumRoles.PROJECTS_SERVIE_OPERATORS))
  @patch(`${BASE_ADDR}/{id}/attachments/commit`, {
    tags,
    summary: 'Save uploaded files',
    description: 'Save uploaded files',
    responses: {204: {}},
  })
  async saveAttachments(
    @param.path.string('id') id: string,
    @param.header.string('file-token') fileToken = '',
  ): Promise<void> {
    const {sub: userId} = await this.keycloakSecurity.getUserInfo();
    return this.projectManagementService.commitUploadedFiles(
      userId,
      id,
      fileToken,
    );
  }

  @intercept(
    protect([EnumRoles.PROJECTS_SERVIE_OPERATORS, EnumRoles.READONLY_OPERATOR]),
  )
  @get(`${BASE_ADDR}/{id}/files`, {
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
  getUploadedFiles(
    @param.path.string('id') id: string,
  ): Promise<BuildingProjectAttachmentsDTO> {
    return this.projectManagementService.getFilesList(id);
  }

  @intercept(protect(EnumRoles.PROJECTS_SERVIE_OPERATORS))
  @del(`${BASE_ADDR}/{id}/files/{file_id}`, {
    tags,
    summary: 'Remove an uploaed file',
    description: 'Remove an uploaed file',
    responses: {204: {}},
  })
  async removeUploadedFile(
    @param.path.string('id', {schema: {pattern: MONGO_ID_REGEX.source}})
    id: string,
    @param.path.string('file_id', {
      schema: {pattern: MONGO_ID_REGEX.source},
    })
    fileId: string,
  ) {
    const {sub: userId} = await this.keycloakSecurity.getUserInfo();
    await this.projectManagementService.removeUploadedFile(userId, id, fileId);
  }

  @intercept(
    protect([EnumRoles.PROJECTS_SERVIE_OPERATORS, EnumRoles.READONLY_OPERATOR]),
  )
  @get(`${BASE_ADDR}/{id}`, {
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
      checkOfficeMembership: true,
    });
  }

  @intercept(
    protect([EnumRoles.PROJECTS_SERVIE_OPERATORS, EnumRoles.READONLY_OPERATOR]),
  )
  @get(`${BASE_ADDR}/{id}/staff`, {
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
    @param.path.string('id') id: string,
  ): Promise<BuildingProjectStaffItemsDTO> {
    const {sub: userId} = await this.keycloakSecurity.getUserInfo();
    return this.projectManagementService.getProjectStaffList(
      userId,
      id,
      [EnumStatus.ACTIVE],
      {
        checkOfficeMembership: true,
        checkUserAccess: false,
      },
    );
  }

  @intercept(protect(EnumRoles.PROJECTS_SERVIE_OPERATORS))
  @post(`${BASE_ADDR}/{id}/staff`, {
    tags,
    summary: 'Add new staff',
    description: 'Add new staff',
    responses: {204: {}},
  })
  async addStaff(
    @requestBody() body: NewProjectStaffRequestDTO,
    @param.path.string('id') id: string,
  ): Promise<void> {
    const {sub: userId} = await this.keycloakSecurity.getUserInfo();
    return this.projectManagementService.addProjectStaff(
      userId,
      id,
      new NewProjectStaffRequestDTO(body),
    );
  }

  @intercept(protect(EnumRoles.PROJECTS_SERVIE_OPERATORS))
  @patch(`${BASE_ADDR}/{id}/state/commit/{state}`, {
    tags,
    summary: 'Commit project state',
    description: 'Commit project state',
    responses: {204: {}},
  })
  async commitProjectState(
    @param.path.string('id', {schema: {pattern: MONGO_ID_REGEX.source}})
    id: string,
    @param.path.number('state', {
      schema: {enum: EnumProgressStatusValues},
    })
    state: EnumProgressStatus,
  ): Promise<void> {
    const {sub: userId} = await this.keycloakSecurity.getUserInfo();
    await this.projectManagementService.commitState(userId, id, state);
  }

  @intercept(protect(EnumRoles.PROJECTS_SERVIE_OPERATORS))
  @patch(`${BASE_ADDR}/{id}/staff/{staff_id}/response`, {
    tags,
    summary: 'Set staff response (operator level)',
    description: 'Set staff response (operator level)',
    responses: {204: {}},
  })
  async setStaffResponse(
    @requestBody() body: SetBuildingProjectStaffResponseDTO,
    @param.path.string('id', {schema: {pattern: MONGO_ID_REGEX.source}})
    id: string,
    @param.path.string('staff_id', {
      schema: {pattern: MONGO_ID_REGEX.source},
    })
    staffId: string,
  ): Promise<void> {
    const {sub: userId} = await this.keycloakSecurity.getUserInfo();
    return this.projectManagementService.setStaffResponse(
      userId,
      id,
      staffId,
      body,
      false,
    );
  }

  @intercept(protect(EnumRoles.PROJECTS_SERVIE_OPERATORS))
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

  @intercept(protect(EnumRoles.PROJECTS_SERVIE_OPERATORS))
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

  @intercept(protect(EnumRoles.PROJECTS_SERVIE_OPERATORS))
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

  @intercept(protect(EnumRoles.NO_BODY))
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
}
