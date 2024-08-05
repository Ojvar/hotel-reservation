import {inject, intercept} from '@loopback/context';
import {ProjectManagementService} from '../services';
import {param, patch, requestBody} from '@loopback/rest';
import {SetBuildingProjectStaffResponseDTO} from '../dto';
import {
  EnumRoles,
  KeycloakSecurity,
  KeycloakSecurityProvider,
  protect,
} from '../lib-keycloak/src';
import {MONGO_ID_REGEX} from '../models';

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
}
