import {inject, intercept} from '@loopback/context';
import {ProjectConverterService, ProjectManagementService} from '../services';
import {
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {
  AddNewJobRequestDTO,
  BuildingProjectDTO,
  BuildingProjectInvoiceFilter,
  BuildingProjectRegistrationCodeDTO,
  JobCandiateResultDTO,
  NewBuildingProjectRequestDTO,
  ProjectSummaryEngineerDTO,
  UpdateInvoiceRequestDTO,
} from '../dto';
import {
  EnumRoles,
  KeycloakSecurity,
  KeycloakSecurityProvider,
  protect,
} from '../lib-keycloak/src';
import {AnyObject, Filter} from '@loopback/repository';

const BASE_ADDR = '/projects/operators';
const tags = ['Projects.Operators'];

@intercept(protect(EnumRoles.PROJECTS_SERVIE_OPERATORS))
export class ProjectOperatorsController {
  constructor(
    @inject(ProjectManagementService.BINDING_KEY)
    private projectManagementService: ProjectManagementService,
    @inject(KeycloakSecurityProvider.BINDING_KEY)
    private keycloakSecurity: KeycloakSecurity,
    @inject(ProjectConverterService.BINDING_KEY)
    private projectConverterService: ProjectConverterService,
  ) {}

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
    @param.path.string('n_id') nId: string,
  ): Promise<BuildingProjectRegistrationCodeDTO> {
    return this.projectManagementService.sendProjectRegistrationCode(nId);
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
    @param.path.string('n_id') nId: string,
    @param.path.string('verification_code') verificationCode: number,
  ): Promise<BuildingProjectDTO> {
    const {sub: userId} = await this.keycloakSecurity.getUserInfo();
    body = new NewBuildingProjectRequestDTO(body);
    return this.projectManagementService.createNewProject(
      userId,
      nId,
      verificationCode,
      body,
    );
  }

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
  async getAllInvoice(
    @param.filter(BuildingProjectInvoiceFilter)
    filter: Filter<BuildingProjectInvoiceFilter> = {},
  ): Promise<AnyObject[]> {
    return this.projectManagementService.getAllInvoices(undefined, filter);
  }

  @patch(`${BASE_ADDR}/invoices/{project_id}/{invoice_id}`, {
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

  @post(`${BASE_ADDR}/jobs/{project_id}`, {
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

  @get(`/test`, {
    tags,
    summary: 'Update an invoice',
    description: 'Update an invoice',
    responses: {204: {}},
  })
  async test(): Promise<void> {
    /*
     * DONE
     *
     * 667d5b9a37efa5eb22b79344
     * 667d5b6bacdaf064905cb269
     * 667d481d9e930e151cbd3981
     * 667d5b84acdaf05b755cb26a
     */

    const body = require('/home/nine/rmq.json').find(
      (x: AnyObject) => x.job.id.toString() === '667d5b84acdaf05b755cb26a',
    );
    if (!body) {
      console.log('not found');
      return;
    }
    const {sub: userId} = await this.keycloakSecurity.getUserInfo();

    await this.projectManagementService.updateJobData(
      userId,
      new JobCandiateResultDTO({...body}),
    );
  }
}
