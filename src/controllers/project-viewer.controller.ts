import {inject, intercept} from '@loopback/context';
import {ProjectManagementService} from '../services';
import {
  EnumRoles,
  KeycloakSecurity,
  KeycloakSecurityProvider,
  protect,
} from '../lib-keycloak/src';
import {get, param} from '@loopback/rest';
import {BuildingProjectDTO} from '../dto';

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
}
