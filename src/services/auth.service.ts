import {injectable, BindingScope, BindingKey, inject} from '@loopback/core';
import {KeycloakSecurity, KeycloakSecurityProvider} from '../lib-keycloak/src';
import {HttpErrors} from '@loopback/rest';

@injectable({scope: BindingScope.REQUEST})
export class AuthService {
  static readonly BINDING_KEY = BindingKey.create<AuthService>(
    `services.${AuthService.name}`,
  );

  constructor(
    @inject(KeycloakSecurityProvider.BINDING_KEY)
    private keycloakSecurity: KeycloakSecurity,
  ) {}

  async getUsername(): Promise<string> {
    const {sub} = await this.keycloakSecurity.getUserInfo();
    if (!sub) {
      throw new HttpErrors.Unauthorized();
    }
    return sub;
  }
}
