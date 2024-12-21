/* eslint-disable @typescript-eslint/naming-convention */
import {inject, Getter} from '@loopback/core';
import {
  DefaultCrudRepository,
  repository,
  BelongsToAccessor,
} from '@loopback/repository';
import {QengDataSource} from '../datasources';
import {
  Reservation,
  ReservationRelations,
  Hotel,
  Discount,
  EnumStatus,
} from '../models';
import {HotelRepository} from './hotel.repository';
import {DiscountRepository} from './discount.repository';

export class ReservationRepository extends DefaultCrudRepository<
  Reservation,
  typeof Reservation.prototype.id,
  ReservationRelations
> {
  public readonly hotel: BelongsToAccessor<
    Hotel,
    typeof Reservation.prototype.id
  >;

  public readonly discount: BelongsToAccessor<
    Discount,
    typeof Reservation.prototype.id
  >;

  constructor(
    @inject(QengDataSource.BINDING_KEY) dataSource: QengDataSource,
    @repository.getter('HotelRepository')
    protected hotelRepositoryGetter: Getter<HotelRepository>,
    @repository.getter('DiscountRepository')
    protected discountRepositoryGetter: Getter<DiscountRepository>,
  ) {
    super(Reservation, dataSource);
    this.discount = this.createBelongsToAccessorFor(
      'discount',
      discountRepositoryGetter,
    );
    this.registerInclusionResolver('discount', this.discount.inclusionResolver);
    this.hotel = this.createBelongsToAccessorFor(
      'hotel',
      hotelRepositoryGetter,
    );
    this.registerInclusionResolver('hotel', this.hotel.inclusionResolver);
  }

  async findConflicts(
    userId: string,
    hotel: Hotel,
    days: Date[],
  ): Promise<Reservation[]> {
    const reservedResult = await this.find({
      where: {
        status: EnumStatus.ACCEPTED,
        hotel_id: hotel.id?.toString(),
        days: {inq: days},
      } as object,
    });

    if (reservedResult.length > 0) {
      return reservedResult;
    }

    // Check for zone reservation restriction
    function formatDate(date: Date) {
      date = new Date(date);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      return `${year}-${month}`;
    }
    const reservationDates = Array.from(new Set(days.map(formatDate)));
    const aggregate = [
      {$match: {user_id: userId, status: EnumStatus.ACCEPTED}},
      {
        $set: {
          days: {
            $map: {
              input: '$days',
              as: 'day',
              in: {$dateToString: {format: '%Y-%m', date: '$$day'}},
            },
          },
        },
      },
      {$match: {days: {$in: reservationDates}}},
      {
        $lookup: {
          from: 'hotels',
          localField: 'hotel_id',
          foreignField: '_id',
          as: 'hotel',
        },
      },
      {$match: {'hotel.zone': hotel.zone}},
    ];
    const pointer = await this.execute(
      Reservation.modelName,
      'aggregate',
      aggregate,
    );
    return (await pointer.toArray()) ?? [];
  }
}
