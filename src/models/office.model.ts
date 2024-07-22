/* eslint-disable @typescript-eslint/naming-convention */
import {model} from '@loopback/repository';
import {Office as BaseOffice} from '../lib-models/src';

@model({
  name: 'offices',
  settings: {
    indexes: [
      {
        keys: {user_id: 1},
        options: {unique: true, name: 'user_id_index'},
      },
    ],
  },
})
export class Office extends BaseOffice {
  constructor(data?: Partial<Office>) {
    super(data);
  }
}
export type Offices = Office[];

export interface OfficeRelations {}
export type OfficeWithRelations = Office & OfficeRelations;
