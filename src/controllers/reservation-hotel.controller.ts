import {repository} from '@loopback/repository';
import {param, get, getModelSchemaRef} from '@loopback/rest';
import {Reservation, Hotel} from '../models';
import {ReservationRepository} from '../repositories';

export class ReservationHotelController {
  constructor(
    @repository(ReservationRepository)
    public reservationRepository: ReservationRepository,
  ) {}

  @get('/reservations/{id}/hotel', {
    responses: {
      '200': {
        description: 'Hotel belonging to Reservation',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Hotel),
          },
        },
      },
    },
  })
  async getHotel(
    @param.path.string('id') id: typeof Reservation.prototype.id,
  ): Promise<Hotel> {
    return this.reservationRepository.hotel(id);
  }
}
