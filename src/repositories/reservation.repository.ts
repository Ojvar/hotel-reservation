import {inject, Getter} from '@loopback/core';
import {
  DefaultCrudRepository,
  repository,
  BelongsToAccessor,
} from '@loopback/repository';
import {QengDataSource} from '../datasources';
import {Reservation, ReservationRelations, Hotel, Discount} from '../models';
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
}
