import {
  BindingKey,
  inject,
  LifeCycleObserver,
  lifeCycleObserver,
} from '@loopback/core';
import {juggler} from '@loopback/repository';

export type AuthDataSourceConfig = {
  baseURL: string;
};

const config = {
  name: 'Auth',
  connector: 'rest',
  // baseURL: '',
  crud: false,
};

const getConfig = ({baseURL}: AuthDataSourceConfig): object => {
  baseURL = baseURL.replace(/^(.*)(\/)$/gi, '$1');
  return {
    ...config,
    baseURL,
    operations: [
      {
        template: {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            authorization: 'Bearer {token}',
          },
          url: `${baseURL}/auth/create-user`,
          body: `{data}`,
        },
        functions: {createUser: ['token', 'data']},
      },
    ],
  };
};

@lifeCycleObserver('datasource')
export class AuthDataSource
  extends juggler.DataSource
  implements LifeCycleObserver
{
  static dataSourceName = 'Auth';
  static readonly defaultConfig = config;

  static BINDING_KEY = BindingKey.create<AuthDataSource>(
    `datasources.${AuthDataSource.dataSourceName}`,
  );
  static CONFIG_BINDING_KEY = BindingKey.create<AuthDataSourceConfig>(
    `datasources.config.${AuthDataSource.dataSourceName}`,
  );

  constructor(
    @inject(AuthDataSource.CONFIG_BINDING_KEY, {optional: true})
    dsConfig: AuthDataSourceConfig = {baseURL: ''},
  ) {
    super(getConfig(dsConfig));
  }
}
