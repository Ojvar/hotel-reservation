import {inject, intercept} from '@loopback/core';
import {get, param} from '@loopback/rest';
import {EngineerService} from '../services';
import {EnumRoles, protect} from '../lib-keycloak/src';
import {AnyObject} from '@loopback/repository';

const BASE_ADDR = '/engineers';
const tags = ['engineers'];

@intercept(protect(EnumRoles.MANUAL_RECEPTION_SERVIE_OPERATOR))
export class EngineerController {
  constructor(
    @inject(EngineerService.BINDING_KEY)
    private engineerService: EngineerService,
  ) {}

  @get(`${BASE_ADDR}/{n_id}`, {
    tags,
    summary: 'Get engineers data',
    description: 'Get engineers data',
    responses: {
      200: {content: {'application/json': {schema: {type: 'object'}}}},
    },
  })
  async getEngineerData(
    @param.path.string('n_id') nId: string,
  ): Promise<Record<string, AnyObject>> {
    return this.engineerService.parseUser(nId);
  }
}
