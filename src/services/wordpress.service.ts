import {BindingKey, inject, Provider} from '@loopback/core';
import {getService} from '@loopback/service-proxy';
import {WordpressDataSource} from '../datasources';

export interface Wordpress {
  setEngineerPadafand(
    token: string,
    caseNo: string,
    jobId: string,
    jobDate: Date,
    nIn: string,
  ): Promise<void>;
}

export class WordpressProvider implements Provider<Wordpress> {
  static readonly BINDING_KEY =
    BindingKey.create<Wordpress>(`services.Wordpress`);

  constructor(
    @inject(WordpressDataSource.BINDING_KEY)
    protected dataSource: WordpressDataSource = new WordpressDataSource(),
  ) {}

  value(): Promise<Wordpress> {
    return getService(this.dataSource);
  }
}
