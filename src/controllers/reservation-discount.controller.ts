import {repository} from '@loopback/repository';
import {param, get, getModelSchemaRef} from '@loopback/rest';
import {Reservation, Discount} from '../models';
import {ReservationRepository} from '../repositories';

export class ReservationDiscountController {
  constructor(
    @repository(ReservationRepository)
    public reservationRepository: ReservationRepository,
  ) {}

  @get('/reservations/{id}/discount', {
    responses: {
      '200': {
        description: 'Discount belonging to Reservation',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Discount),
          },
        },
      },
    },
  })
  async getDiscount(
    @param.path.string('id') id: typeof Reservation.prototype.id,
  ): Promise<Discount> {
    return this.reservationRepository.discount(id);
  }
}
