import {inject, intercept} from '@loopback/context';
import {getModelSchemaRef, param, post} from '@loopback/rest';
import {BuildingProjectDTO} from '../dto';
import {
  EnumRoles,
  KeycloakSecurity,
  KeycloakSecurityProvider,
  protect,
} from '../lib-keycloak/src';
import {ProjectConverterService} from '../services';

const BASE_ADDR = '/projects/operators/';
const tags = ['Projects.Converter'];

@intercept(protect(EnumRoles.NO_BODY))
export class ProjectConverterController {
  constructor(
    @inject(KeycloakSecurityProvider.BINDING_KEY)
    private keycloakSecurity: KeycloakSecurity,
    @inject(ProjectConverterService.BINDING_KEY)
    private projectConverterService: ProjectConverterService,
  ) {}

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
}
