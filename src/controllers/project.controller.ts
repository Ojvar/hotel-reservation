import {inject, intercept} from '@loopback/core';
import {ProjectService} from '../services';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {ProjectsSummaryDTO, ProjectSummaryDTO} from '../dto';
import {EnumRoles, protect} from '../lib-keycloak/src';
import {Filter} from '@loopback/repository';

const BASE_ADDR = '/projects';
const tags = ['projects'];

@intercept(protect(EnumRoles.MANUAL_RECEPTION_SERVIE_OPERATOR))
export class ProjectController {
  constructor(
    @inject(ProjectService.BINDING_KEY) private projectService: ProjectService,
  ) {}

  @get(`${BASE_ADDR}/{case_no}`, {
    tags,
    summary: 'Get projects list by case-no',
    description: 'Get projects list by case-no',
    responses: {
      200: {
        content: {
          'application/json': {schema: getModelSchemaRef(ProjectSummaryDTO)},
        },
      },
    },
  })
  async getProjectByCaseNo(
    @param.path.string('case_no') caseNo: string,
  ): Promise<ProjectSummaryDTO> {
    return this.projectService.getProjectSummaryByCaseNo(caseNo);
  }

  @get(`${BASE_ADDR}`, {
    tags,
    summary: 'Get projects list',
    description: 'Get projects list',
    responses: {
      200: {
        content: {
          'application/json': {schema: getModelSchemaRef(ProjectSummaryDTO)},
        },
      },
    },
  })
  async getProjectsList(
    @param.filter(ProjectSummaryDTO) filter?: Filter<ProjectSummaryDTO>,
  ): Promise<ProjectsSummaryDTO> {
    return this.projectService.getProjectSummary(filter);
  }
}
