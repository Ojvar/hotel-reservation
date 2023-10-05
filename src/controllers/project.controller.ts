import {inject, intercept} from '@loopback/core';
import {ProjectService} from '../services';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {ProjectSummaryDTO} from '../dto';
import {EnumRoles, protect} from '../lib-keycloak/src';

const BASE_ADDR = '/projects';
const tags = ['projects'];

@intercept(protect(EnumRoles.MANUAL_RECEPTION_SERVIE_OPERATOR))
export class ProjectController {
  constructor(
    @inject(ProjectService.BINDING_KEY) private projectService: ProjectService,
  ) {}

  @get(`${BASE_ADDR}/{case_no}`, {
    tags,
    summary: 'Get projects list by engineers data',
    description: 'Get projects list by engineers data',
    responses: {
      200: {
        content: {
          'application/json': {schema: getModelSchemaRef(ProjectSummaryDTO)},
        },
      },
    },
  })
  async get(
    @param.path.string('case_no') caseNo: string,
  ): Promise<ProjectSummaryDTO> {
    return this.projectService.getProjectSummaryByCaseNo(caseNo);
  }
}
