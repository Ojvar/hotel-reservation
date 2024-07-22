/* eslint-disable @typescript-eslint/naming-convention */
import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {QengDataSource} from '../datasources';
import {
  EnumOfficeMemberRole,
  EnumStatus,
  Office,
  OfficeRelations,
  Offices,
} from '../models';

export class OfficeRepository extends DefaultCrudRepository<
  Office,
  typeof Office.prototype.id,
  OfficeRelations
> {
  constructor(@inject(QengDataSource.BINDING_KEY) dataSource: QengDataSource) {
    super(Office, dataSource);
  }

  getOfficesByUserMembership(
    userId: string,
    roles: EnumOfficeMemberRole[],
    now = new Date(),
  ): Promise<Offices> {
    return this.find({
      where: {
        members: {
          elemMatch: {
            user_id: userId,
            status: EnumStatus.ACTIVE,
            'membership.status': EnumStatus.ACTIVE,
            'membership.role': {$in: roles},
            'membership.from': {$lte: now},
            'membership.to': {$gte: now},
          },
        },
      } as object,
    });
  }
}
