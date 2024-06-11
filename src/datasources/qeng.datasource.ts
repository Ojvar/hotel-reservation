import {
  BindingKey,
  inject,
  LifeCycleObserver,
  lifeCycleObserver,
} from '@loopback/core';
import {juggler} from '@loopback/repository';

export type QengDataSourceConfig = {
  url: string;
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
};

const config = {
  name: 'Qeng',
  connector: 'mongodb',
  // url: '',
  // host: 'knode3.qeng.ir',
  // port: 27017,
  // user: '',
  // password: '',
  // database: '',
  useNewUrlParser: true,
};

@lifeCycleObserver('datasource')
export class QengDataSource
  extends juggler.DataSource
  implements LifeCycleObserver
{
  static dataSourceName = 'Qeng';
  static readonly defaultConfig = config;

  static BINDING_KEY = BindingKey.create<QengDataSource>(
    `datasources.${QengDataSource.dataSourceName}`,
  );
  static CONFIG_BINDING_KEY = BindingKey.create<QengDataSourceConfig>(
    `datasources.config.${QengDataSource.dataSourceName}`,
  );

  constructor(
    @inject(QengDataSource.CONFIG_BINDING_KEY, {optional: true})
    dsConfig: QengDataSourceConfig,
  ) {
    super({...dsConfig, ...config});
    super.once('connected', () => {
      super.autoupdate().catch(console.error);
    });
  }
}
