/* eslint-disable @typescript-eslint/naming-convention */
import {get, getModelSchemaRef, param, post, requestBody} from '@loopback/rest';
import {
  EnumRoles,
  KeycloakSecurity,
  KeycloakSecurityProvider,
  protect,
} from '../lib-keycloak/src';
import {inject, intercept} from '@loopback/context';
import {ProjectManagementService} from '../services';
import {
  BuildingProjectInvoiceDTO,
  BuildingProjectInvoiceFilter,
  NewBuildingProjectInvoiceRequestDTO,
} from '../dto';
import {AnyObject, Filter} from '@loopback/repository';

const BASE_ADDR = '/projects/{project_id}/invoices';
const tags = ['Projects.Invoice'];

@intercept(protect(EnumRoles.PROJECTS_SERVICE_MANAGER))
export class ProjectInvoiceController {
  constructor(
    @inject(KeycloakSecurityProvider.BINDING_KEY)
    private keycloakSecurity: KeycloakSecurity,
    @inject(ProjectManagementService.BINDING_KEY)
    private projectManagementService: ProjectManagementService,
  ) {}

  @post(`${BASE_ADDR}`, {
    tags,
    summary: 'Add new invoice',
    description: 'Add new invoice',
    responses: {204: {content: {'application/json': {}}}},
  })
  async addNewInvoice(
    @requestBody() body: NewBuildingProjectInvoiceRequestDTO,
    @param.path.string('project_id') project_id: string,
  ): Promise<void> {
    const {sub: userId} = await this.keycloakSecurity.getUserInfo();
    body = new NewBuildingProjectInvoiceRequestDTO(body);
    await this.projectManagementService.addNewInvoice(userId, project_id, body);
  }

  @get(`${BASE_ADDR}/{invoice_id}`, {
    tags,
    summary: 'Get invioce by Id',
    description: 'Get invioce by Id',
    responses: {
      200: {
        content: {
          'application/json': {
            schema: getModelSchemaRef(BuildingProjectInvoiceDTO),
          },
        },
      },
    },
  })
  async getInvoiceById(
    @param.path.string('project_id') projectId: string,
    @param.path.string('invoice_id') invoiceId: string,
  ): Promise<BuildingProjectInvoiceDTO> {
    return this.projectManagementService.getInvoiceById(projectId, invoiceId);
  }

  @get(`${BASE_ADDR}`, {
    tags,
    summary: 'Get all invioces',
    description: 'Get all invioces',
    responses: {
      200: {
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Object),
            },
          },
        },
      },
    },
  })
  async getAllInvoice(
    @param.path.string('project_id') projectId: string,
    @param.filter(BuildingProjectInvoiceFilter)
    filter: Filter<BuildingProjectInvoiceFilter> = {},
  ): Promise<AnyObject[]> {
    return this.projectManagementService.getAllInvoices(projectId, filter);
  }
}
