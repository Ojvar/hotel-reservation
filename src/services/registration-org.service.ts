import {BindingKey, inject, Provider} from '@loopback/core';
import {getService} from '@loopback/service-proxy';
import {RegistrationOrgDataSource} from '../datasources';
import {DocumentValidationResultDTO} from '../dto';

export interface RegistrationOrg {
  documentVerification(
    documentNo: string,
    authPwd: string,
  ): Promise<DocumentValidationResultDTO>;
}

export class RegistrationOrgProvider implements Provider<RegistrationOrg> {
  static readonly BINDING_KEY = BindingKey.create<RegistrationOrg>(
    `services.RegistrationOrg`,
  );

  constructor(
    @inject(RegistrationOrgDataSource.BINDING_KEY)
    protected dataSource: RegistrationOrgDataSource = new RegistrationOrgDataSource(),
  ) {}

  value(): Promise<RegistrationOrg> {
    return getService(this.dataSource);
  }
}
