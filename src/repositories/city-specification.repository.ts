import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {QengDataSource} from '../datasources';
import {CitySpecification, CitySpecificationRelations} from '../lib-models/src';

export class CitySpecificationRepository extends DefaultCrudRepository<
  CitySpecification,
  typeof CitySpecification.prototype.id,
  CitySpecificationRelations
> {
  constructor(@inject(QengDataSource.BINDING_KEY) dataSource: QengDataSource) {
    super(CitySpecification, dataSource);
  }
}
