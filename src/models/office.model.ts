/* eslint-disable @typescript-eslint/naming-convention */
import {model} from '@loopback/repository';
import {
  EnumOfficeMemberRole,
  EnumStatus,
  Office as BaseOffice,
  OfficeMember,
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

  checkUserAccess(
    userId: string,
    userAccessLevels: EnumOfficeMemberRole[] = [
      EnumOfficeMemberRole.OWNER,
      EnumOfficeMemberRole.SECRETARY,
      EnumOfficeMemberRole.CO_FOUNDER,
    ],
    allowedStatus: EnumStatus[] = [EnumStatus.ACTIVE],
  ): boolean {
    const now = +new Date();
    return (
      allowedStatus.includes(this.status) &&
      !!this.members.find(
        m =>
          m.user_id === userId &&
          m.status === EnumStatus.ACTIVE &&
          userAccessLevels.includes(m.membership.role) &&
          +m.membership.from <= now &&
          +(m.membership.to ?? now) >= now,
      )
    );
  }

  getMemberDataByUserId(
    userId: string,
    date = new Date(),
  ): OfficeMember | undefined {
    return this.members.find(
      m =>
        m.user_id === userId &&
        m.status === EnumStatus.ACTIVE &&
        m.membership.from <= date &&
        (m.membership.to ? date <= m.membership.to : true),
    );
  }
}
export type Offices = Office[];

export interface OfficeRelations {}
export type OfficeWithRelations = Office & OfficeRelations;
