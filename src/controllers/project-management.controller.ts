import {inject, intercept} from '@loopback/context';
import {ProjectManagementService} from '../services';
import {getModelSchemaRef, param, post} from '@loopback/rest';
import {ProjectRegistrationCodeDTO, ProjectSummaryEngineerDTO} from '../dto';
import {EnumRoles, protect} from '../lib-keycloak/src';

const BASE_ADDR = '/project-management';
const tags = ['ProjectManagement'];

@intercept(protect(EnumRoles.PROJECTS_SERVIE_MANAGER))
export class ProjectManagementController {
  constructor(
    @inject(ProjectManagementService.BINDING_KEY)
    private projectMangementService: ProjectManagementService,
  ) {}

  @post(`${BASE_ADDR}/{n_id}`, {
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
  ): Promise<ProjectRegistrationCodeDTO> {
    return this.projectMangementService.sendProjectRegistrationCode(nId);
  }
}
