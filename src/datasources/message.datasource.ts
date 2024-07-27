import {
  BindingKey,
  inject,
  LifeCycleObserver,
  lifeCycleObserver,
} from '@loopback/core';
import {juggler} from '@loopback/repository';
import {MessageDataSourceConfig} from '../lib-message-service/src';

const config = {
  name: 'Message',
  connector: 'rest',
  // baseURL: '',
  crud: false,
};

@lifeCycleObserver('datasource')
export class MessageDataSource
  extends juggler.DataSource
  implements LifeCycleObserver
{
  static dataSourceName = 'Message';
  static readonly defaultConfig = config;

  static BINDING_KEY = BindingKey.create<MessageDataSource>(
    `datasources.${MessageDataSource.dataSourceName}`,
  );
  static CONFIG_BINDING_KEY = BindingKey.create<MessageDataSourceConfig>(
    `datasources.config.${MessageDataSource.dataSourceName}`,
  );

  constructor(
    @inject(MessageDataSource.CONFIG_BINDING_KEY, {optional: true})
    dsConfig: MessageDataSourceConfig = {baseURL: '', ...config},
  ) {
    super({...dsConfig, ...config});
  }
}
