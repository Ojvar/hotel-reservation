import {model} from '@loopback/repository';
import {BaseData as BaseBaseData} from '../lib-models/src';

@model({
  name: 'basedata',
  settings: {indexes: [{keys: {key: 1}, options: {name: 'key_idx'}}]},
})
export class BaseData extends BaseBaseData {
  constructor(data?: Partial<BaseData>) {
    super(data);
  }
}

export interface BaseDataRelations {}
export type BaseDataWithRelations = BaseData & BaseDataRelations;
