/* eslint-disable @typescript-eslint/naming-convention */
import {model} from '@loopback/repository';
import {
  EnumOfficeMemberRole,
  EnumStatus,
  Office as BaseOffice,
} from '../lib-models/src';

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

  checkUserAccess(userId: string): boolean {
    return !!this.members.find(
      m =>
        m.user_id === userId &&
        m.status === EnumStatus.ACTIVE &&
        [
          EnumOfficeMemberRole.OWNER,
          EnumOfficeMemberRole.SECRETARY,
          EnumOfficeMemberRole.CO_FOUNDER,
        ].includes(m.membership.role),
    );
  }
}
export type Offices = Office[];

export interface OfficeRelations {}
export type OfficeWithRelations = Office & OfficeRelations;
