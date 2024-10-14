import {inject, intercept} from '@loopback/core';
import {Filter} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {
  ProjectDetailsDTO,
  ProjectsSummaryDTO,
  ProjectSummaryDTO,
  WorkRefReadyDTO,
  WorkRefReadyListDTO,
} from '../dto';
import {EnumRoles, protect} from '../lib-keycloak/src';
import {ProjectService} from '../services';

const BASE_ADDR = '/projects';
const tags = ['Projects'];

@intercept(protect(EnumRoles.MANUAL_RECEPTION_SERVIE_OPERATOR))
export class ProjectController {
  constructor(
    @inject(ProjectService.BINDING_KEY) private projectService: ProjectService,
  ) {}

  @get(`${BASE_ADDR}/{case_no}/details`, {
    tags,
    summary: "Get project's details by case-no",
    description: "Get project's details by case-no",
    responses: {
      200: {
        content: {
          'application/json': {schema: getModelSchemaRef(ProjectDetailsDTO)},
        },
      },
    },
  })
  async getProjectDetailsByCaseNo(
    @param.path.string('case_no') caseNo: string,
  ): Promise<ProjectDetailsDTO> {
    return this.projectService.getProjectDetailsByCaseNo(caseNo);
  }

  @get(`${BASE_ADDR}/{case_no}`, {
    tags,
    summary: 'Get project summary by case-no',
    description: 'Get project summary by case-no',
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
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(ProjectSummaryDTO),
            },
          },
        },
      },
    },
  })
  async getProjectsList(
    @param.filter(ProjectSummaryDTO) filter?: Filter<ProjectSummaryDTO>,
  ): Promise<ProjectsSummaryDTO> {
    return this.projectService.getProjectSummary(filter);
  }

  @get(`${BASE_ADDR}/workref-ready-list`, {
    tags,
    summary: 'Get work-ref ready projects list',
    description: 'Get work-ref ready projects list',
    responses: {
      200: {
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(WorkRefReadyDTO),
            },
          },
        },
      },
    },
  })
  async getWorkrefReadyList(): Promise<WorkRefReadyListDTO> {
    return this.projectService.readyForWorkRefList();
  }
}
