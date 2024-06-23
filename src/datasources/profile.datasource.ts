import {
  BindingKey,
  inject,
  LifeCycleObserver,
  lifeCycleObserver,
} from '@loopback/core';
import {juggler} from '@loopback/repository';

export type ProfileDataSourceConfig = {
  baseURL: string;
};

const config = {
  name: 'Profile',
  connector: 'rest',
  // baseURL: '',
  crud: false,
};

const getConfig = ({baseURL}: ProfileDataSourceConfig): object => {
  baseURL = baseURL.replace(/^(.*)(\/)$/gi, '$1');
  return {
    ...config,
    baseURL,
    operations: [
      {
        template: {
          method: 'GET',
          headers: {
            'content-type': 'application/json',
            authorization: 'Bearer {token}',
          },
          url: `${baseURL}/user-profile/info/{nId}`,
        },
        functions: {userProfile: ['token', 'nId']},
      },
    ],
  };
};

@lifeCycleObserver('datasource')
export class ProfileDataSource
  extends juggler.DataSource
  implements LifeCycleObserver
{
  static dataSourceName = 'Profile';
  static readonly defaultConfig = config;

  static BINDING_KEY = BindingKey.create<ProfileDataSource>(
    `datasources.${ProfileDataSource.dataSourceName}`,
  );
  static CONFIG_BINDING_KEY = BindingKey.create<ProfileDataSourceConfig>(
    `datasources.config.${ProfileDataSource.dataSourceName}`,
  );

  constructor(
    @inject(ProfileDataSource.CONFIG_BINDING_KEY, {optional: true})
    dsConfig: ProfileDataSourceConfig = {baseURL: ''},
  ) {
    super(getConfig(dsConfig));
  }
}
