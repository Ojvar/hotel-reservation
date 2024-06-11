import {inject} from '@loopback/context';
import {ProjectManagementService} from '../services';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {ProjectRegistrationCodeDTO, ProjectSummaryEngineerDTO} from '../dto';

const BASE_ADDR = '/project-management';
const tags = ['ProjectManagement'];

export class ProjectManagementController {
  constructor(
    @inject(ProjectManagementService.BINDING_KEY)
    private projectMangementService: ProjectManagementService,
  ) {}

  @get(`${BASE_ADDR}/{n_id}`, {
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
