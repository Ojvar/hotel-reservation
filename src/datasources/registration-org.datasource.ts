import {
  BindingKey,
  inject,
  LifeCycleObserver,
  lifeCycleObserver,
} from '@loopback/core';
import {juggler} from '@loopback/repository';

export type RegistrationOrgDataSourceConfig = {
  baseURL: string;
};

const config = {
  name: 'RegistrationOrg',
  connector: 'rest',
  // baseURL: '',
  crud: false,
};

const getConfig = ({baseURL}: RegistrationOrgDataSourceConfig): object => {
  baseURL = baseURL.replace(/^(.*)(\/)$/gi, '$1');
  return {
    ...config,
    baseURL,
    operations: [
      {
        template: {
          method: 'POST',
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
            authorization: 'bearer null',
          },
          url: `${baseURL}/ssar/documentverification`,
          form: {nationalRegisterNo: '{documentNo}', secretNo: '{authPwd}'},
        },
        functions: {documentVerification: ['documentNo', 'authPwd']},
      },
    ],
  };
};

@lifeCycleObserver('datasource')
export class RegistrationOrgDataSource
  extends juggler.DataSource
  implements LifeCycleObserver
{
  static dataSourceName = 'RegistrationOrg';
  static readonly defaultConfig = config;

  static BINDING_KEY = BindingKey.create<RegistrationOrgDataSource>(
    `datasources.${RegistrationOrgDataSource.dataSourceName}`,
  );
  static CONFIG_BINDING_KEY =
    BindingKey.create<RegistrationOrgDataSourceConfig>(
      `datasources.config.${RegistrationOrgDataSource.dataSourceName}`,
    );

  constructor(
    @inject(RegistrationOrgDataSource.CONFIG_BINDING_KEY, {optional: true})
    dsConfig: RegistrationOrgDataSourceConfig = {baseURL: ''},
  ) {
    super(getConfig(dsConfig));
  }
}
