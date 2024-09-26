/* eslint-disable @typescript-eslint/naming-convention */
import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const BASE_URL = 'https://api.qeng.ir/api/v1/wp-service';

const config = {
  name: 'Wordpress',
  connector: 'rest',
  baseURL: 'https://api.qeng.ir/api/v1/wp-service',
  crud: false,
  operations: [
    {
      template: {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json',
          authorization: 'Bearer {token}',
        },
        url: `${BASE_URL}/wordpress/set-engineer-padafand`,
        body: {
          case_no: '{caseNo}',
          job_id: '{jobId}',
          job_date: '{jobDate}',
          n_in: '{nIn}',
        },
      },
      functions: {
        setEngineerPadafand: ['token', 'caseNo', 'jobId', 'jobDate', 'nIn'],
      },
    },
  ],
};

@lifeCycleObserver('datasource')
export class WordpressDataSource
  extends juggler.DataSource
  implements LifeCycleObserver
{
  static dataSourceName = 'Wordpress';
  static readonly defaultConfig = config;

  static readonly BINDING_KEY = `datasources.${WordpressDataSource.dataSourceName}`;
  static readonly CONFIG_BINDING_KEY = `datasources.config.${WordpressDataSource.dataSourceName}`;

  constructor(
    @inject(WordpressDataSource.CONFIG_BINDING_KEY, {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
