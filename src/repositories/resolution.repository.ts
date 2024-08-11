import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {QengDataSource} from '../datasources';
import {Resolution, ResolutionRelations} from '../models';

export class ResolutionRepository extends DefaultCrudRepository<
  Resolution,
  typeof Resolution.prototype.id,
  ResolutionRelations
> {
  constructor(@inject(QengDataSource.BINDING_KEY) dataSource: QengDataSource) {
    super(Resolution, dataSource);
  }
}
