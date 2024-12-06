import {get, getModelSchemaRef, param, post, requestBody} from '@loopback/rest';
import {ReservationService} from '../services';
import {
  NewReservationDTO,
  ReservationDTO,
  ReservationFilter,
  ReservationsDTO,
} from '../dto';
import {Filter} from '@loopback/repository';
import {inject} from '@loopback/context';

const BASE_ADDR = '/reservations/';
const tags = ['Reservations'];

export class ReservationController {
  constructor(
    @inject(ReservationService.BINDING_KEY)
    private reservationService: ReservationService,
  ) {}

  @get(`${BASE_ADDR}`, {
    tags,
    summary: 'Get reservations list',
    description: 'Get reservations list',
    responses: {
      200: {
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(ReservationDTO)},
          },
        },
      },
    },
  })
  getReservations(
    @param.filter(ReservationFilter) filter: Filter<ReservationFilter> = {},
  ): Promise<ReservationsDTO> {
    return this.reservationService.getReservations(filter);
  }

  @post(`${BASE_ADDR}`, {
    tags,
    summary: 'Register reservations',
    description: 'Register reservations',
    responses: {
      200: {
        content: {
          'application/json': {schema: getModelSchemaRef(ReservationDTO)},
        },
      },
    },
  })
  registerReservations(
    @requestBody() body: NewReservationDTO,
  ): Promise<ReservationDTO> {
    const operatorId = '';
    body.user_id = operatorId;
    return this.reservationService.newReservations(
      operatorId,
      new NewReservationDTO(body),
    );
  }
}
