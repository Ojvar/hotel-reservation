import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {QengDataSource} from '../datasources';
import {Hotel, HotelRelations} from '../models';
import {HttpErrors} from '@loopback/rest';

export class HotelRepository extends DefaultCrudRepository<
  Hotel,
  typeof Hotel.prototype.id,
  HotelRelations
> {
  constructor(@inject(QengDataSource.BINDING_KEY) dataSource: QengDataSource) {
    super(Hotel, dataSource);
  }

  async findHotelByIdOrFail(hotelId: string): Promise<Hotel> {
    const hotel = await this.findById(hotelId);
    if (!hotel) {
      throw new HttpErrors.NotFound(`Hotel not found, id: ${hotelId}`);
    }
    return hotel;
  }
}
