import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {QengDataSource} from '../datasources';
import {BaseData, BaseDataRelations} from '../models';

export class BaseDataRepository extends DefaultCrudRepository<
  BaseData,
  typeof BaseData.prototype.id,
  BaseDataRelations
> {
  constructor(@inject(QengDataSource.BINDING_KEY) dataSource: QengDataSource) {
    super(BaseData, dataSource);
  }
}
