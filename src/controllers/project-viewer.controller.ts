import {inject, intercept} from '@loopback/context';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {
  BuildingProjectAttachmentDTO,
  BuildingProjectAttachmentsDTO,
  BuildingProjectDTO,
} from '../dto';
import {
  EnumRoles,
  KeycloakSecurity,
  KeycloakSecurityProvider,
  protect,
} from '../lib-keycloak/src';
import {ProjectManagementService} from '../services';

const BASE_ADDR = '/projects/services';
const tags = ['Projects.Services'];

@intercept(protect(EnumRoles.PROJECTS_SERVICE_CLIENTS))
export class ProjectViewerController {
  constructor(
    @inject(ProjectManagementService.BINDING_KEY)
    private projectManagementService: ProjectManagementService,
    @inject(KeycloakSecurityProvider.BINDING_KEY)
    private keycloakSecurity: KeycloakSecurity,
  ) {}

  @get(`${BASE_ADDR}/{project_id}/details`, {
    tags,
    summary: 'View Project Details',
    description: 'View Project Details',
    responses: {
      200: {content: {'application/json': {}}},
    },
  })
  async getProjectDetails(
    @param.path.string('project_id') projectId: string,
  ): Promise<BuildingProjectDTO> {
    const {sub: userId} = await this.keycloakSecurity.getUserInfo();
    return this.projectManagementService.getProjectDetailsById(
      userId,
      projectId,
      {checkOfficeMembership: false, checkUserAccess: false},
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
      checkOfficeMembership: false,
      checkUserAccess: false,
    });
  }
}
