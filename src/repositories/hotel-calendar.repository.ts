/* eslint-disable @typescript-eslint/naming-convention */
import {inject, Getter} from '@loopback/core';
import {
  DefaultCrudRepository,
  repository,
  BelongsToAccessor,
} from '@loopback/repository';
import {QengDataSource} from '../datasources';
import {
  HotelCalendar,
  HotelCalendarRelations,
  Hotel,
  EnumStatus,
} from '../models';
import {HotelRepository} from './hotel.repository';
import {HttpErrors} from '@loopback/rest';

export class HotelCalendarRepository extends DefaultCrudRepository<
  HotelCalendar,
  typeof HotelCalendar.prototype.id,
  HotelCalendarRelations
> {
  public readonly hotel: BelongsToAccessor<
    Hotel,
    typeof HotelCalendar.prototype.id
  >;

  constructor(
    @inject(QengDataSource.BINDING_KEY) dataSource: QengDataSource,
    @repository.getter('HotelRepository')
    protected hotelRepositoryGetter: Getter<HotelRepository>,
  ) {
    super(HotelCalendar, dataSource);
    this.hotel = this.createBelongsToAccessorFor(
      'hotel',
      hotelRepositoryGetter,
    );
    this.registerInclusionResolver('hotel', this.hotel.inclusionResolver);
  }

  async findByHotelIdAndYearOrFail(
    hotelId: string,
    year: number,
  ): Promise<HotelCalendar> {
    const hotelCalendar = await this.findByHotelIdAndYearOrNull(hotelId, year);
    if (!hotelCalendar) {
      throw new HttpErrors.NotFound(
        `Hotel calendare not found, HotelId: ${hotelId}, Year: ${year}`,
      );
    }
    return hotelCalendar;
  }

  async findByHotelIdAndYearOrNull(
    hotelId: string,
    year: number,
  ): Promise<HotelCalendar | null> {
    return this.findOne({
      where: {hotel_id: hotelId, status: EnumStatus.ACTIVE, year},
    });
  }
}
