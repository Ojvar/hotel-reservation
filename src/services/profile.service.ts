import {BindingKey, inject, Provider} from '@loopback/core';
import {getService} from '@loopback/service-proxy';
import {ProfileDataSource} from '../datasources';
import {AnyObject} from '@loopback/repository';

export interface ProfileService {
  userProfile(token: string, nId: string): Promise<AnyObject>;
}

export class ProfileServiceProvider implements Provider<ProfileService> {
  static BINDING_KEY = BindingKey.create<ProfileService>(
    `services.ProfileService`,
  );

  constructor(
    @inject(ProfileDataSource.BINDING_KEY)
    protected dataSource: ProfileDataSource = new ProfileDataSource(),
  ) {}

  value(): Promise<ProfileService> {
    return getService(this.dataSource);
  }
}
