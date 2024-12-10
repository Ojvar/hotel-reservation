/* eslint-disable @typescript-eslint/naming-convention */
import {
  BindingKey,
  inject,
  lifeCycleObserver,
  LifeCycleObserver,
} from '@loopback/core';
import {AnyObject, juggler} from '@loopback/repository';

export type EwalletDataSourceConfig = {
  baseURL: string;
};

const config = {
  name: 'Ewallet',
  connector: 'rest',
  //baseURL: '',
  crud: false,
};

const getConfig = ({baseURL}: AnyObject & EwalletDataSourceConfig): object => {
  baseURL = baseURL.replace(/\/$/g, '');
  return {
    ...config,
    baseURL,
    options: {headers: {'content-type': 'application/json'}},
    operations: [
      {
        template: {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            authorization: 'Bearer {token}',
          },
          body: {
            source_user_id: '{sourceEWalletUserId}',
            target_user_id: '{targetEWalletUserId}',
            amount: '{amount}',
            description: '{description}',
            meta: '{meta}',
          },
        },
        functions: {
          transfer: [
            'token',
            'sourceEWalletUserId',
            'targetEWalletUserId',
            'amount',
            'description',
            'meta',
          ],
        },
      },
    ],
  };
};

@lifeCycleObserver('datasource')
export class EwalletDataSource
  extends juggler.DataSource
  implements LifeCycleObserver
{
  static dataSourceName = 'Ewallet';
  static readonly defaultConfig = config;

  static readonly BINDING_KEY = BindingKey.create<EwalletDataSource>(
    `datasources.${EwalletDataSource.dataSourceName}`,
  );
  static readonly CONFIG_BINDING_KEY =
    BindingKey.create<EwalletDataSourceConfig>(
      `datasources.config.${EwalletDataSource.dataSourceName}`,
    );

  constructor(
    @inject(EwalletDataSource.CONFIG_BINDING_KEY, {optional: true})
    dsConfig: EwalletDataSourceConfig = {baseURL: ''},
  ) {
    console.debug(getConfig(dsConfig));
    super(getConfig(dsConfig));
  }
}
