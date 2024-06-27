import {BindingKey, inject, Provider} from '@loopback/core';
import {getService} from '@loopback/service-proxy';
import {AnyObject} from '@loopback/repository';
import {AuthDataSource} from '../datasources/';

export interface AuthService {
  createUser(token: string, data: AnyObject): Promise<AnyObject>;
}

export class AuthServiceProvider implements Provider<AuthService> {
  static BINDING_KEY = BindingKey.create<AuthService>(`services.AuthService`);

  constructor(
    @inject(AuthDataSource.BINDING_KEY)
    protected dataSource: AuthDataSource = new AuthDataSource(),
  ) {}

  value(): Promise<AuthService> {
    return getService(this.dataSource);
  }
}
