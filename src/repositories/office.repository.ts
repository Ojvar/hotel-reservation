import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {QengDataSource} from '../datasources';
import {Office, OfficeRelations} from '../models';

export class OfficeRepository extends DefaultCrudRepository<
  Office,
  typeof Office.prototype.id,
  OfficeRelations
> {
  constructor(@inject(QengDataSource.BINDING_KEY) dataSource: QengDataSource) {
    super(Office, dataSource);
  }
}
