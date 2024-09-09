import {inject, intercept} from '@loopback/context';
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
  BuildingProjectStaffItemDTO,
  BuildingProjectStaffItemsDTO,
  BuildingProjectsDTO,
  SetBuildingProjectStaffResponseDTO,
  SignFilesRequestDTO,
} from '../dto';
import {
  EnumRoles,
  KeycloakSecurity,
  KeycloakSecurityProvider,
  protect,
} from '../lib-keycloak/src';
import {EnumStatus, MONGO_ID_REGEX} from '../models';

const BASE_ADDR = '/projects/staff';
const tags = ['Projects.Staff'];

@intercept(protect(EnumRoles.NO_BODY))
export class ProjectStaffController {
  constructor(
    @inject(ProjectManagementService.BINDING_KEY)
    private projectManagementService: ProjectManagementService,
    @inject(KeycloakSecurityProvider.BINDING_KEY)
    private keycloakSecurity: KeycloakSecurity,
  ) {}

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
        checkOfficeMembership: false,
        checkUserAccess: true,
      },
    );
  }

  @patch(`${BASE_ADDR}/{project_id}/sign`, {
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

  @get(`${BASE_ADDR}/{project_id}/details`, {
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
    return this.projectManagementService.getProjectByUserId(userId, id, {
      checkUserAccess: true,
      checkOfficeMembership: false,
    });
  }

  @patch(`${BASE_ADDR}/{id}/staff/{staff_id}/response`, {
    tags,
    summary: 'Set staff response',
    description: 'Set staff response',
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
      true,
    );
  }

  @get(`${BASE_ADDR}/requests`, {
    tags,
    summary: 'Get staff requests list',
    description: 'Get Staff requests list',
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
  async getStaffRequestList(): Promise<BuildingProjectsDTO> {
    const {sub: userId} = await this.keycloakSecurity.getUserInfo();
    return this.projectManagementService.getStaffRequestsListByUserId(userId);
  }
}
