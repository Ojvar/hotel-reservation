import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {QengDataSource} from '../datasources';
import {Hotel, HotelRelations} from '../models';

export class HotelRepository extends DefaultCrudRepository<
  Hotel,
  typeof Hotel.prototype.id,
  HotelRelations
> {
  constructor(@inject(QengDataSource.BINDING_KEY) dataSource: QengDataSource) {
    super(Hotel, dataSource);
  }
}
