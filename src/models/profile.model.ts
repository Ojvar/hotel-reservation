/* eslint-disable @typescript-eslint/naming-convention */
import {model} from '@loopback/repository';
import {Profile as BaseProfile} from '../lib-models/src';

@model({
  name: 'profiles',
  settings: {
    indexes: [
      {
        keys: {user_id: 1},
        options: {unique: true, name: 'user_id_index'},
      },
      {keys: {n_in: 1}, options: {name: 'n_in_idx'}},
    ],
  },
})
export class Profile extends BaseProfile {
  constructor(data?: Partial<Profile>) {
    super(data);
  }
}
export type Profiles = Profile[];

export interface ProfileRelations {}
export type ProfileWithRelations = Profile & ProfileRelations;
