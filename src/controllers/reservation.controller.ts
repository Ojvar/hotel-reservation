import {inject, intercept} from '@loopback/context';
import {get, getModelSchemaRef, param, post, requestBody} from '@loopback/rest';
import {
  NewReservationDTO,
  ReservationDTO,
  ReservationFilter,
  ReservationsDTO,
} from '../dto';
import {EnumRoles, protect} from '../lib-keycloak/src';
import {AuthService, ReservationService} from '../services';
import {Filter} from '@loopback/repository';

const BASE_ADDR = '/reservations/';
const tags = ['Reservations'];

@intercept(protect(EnumRoles.NO_BODY))
export class ReservationController {
  constructor(
    @inject(ReservationService.BINDING_KEY)
    private reservationService: ReservationService,
    @inject(AuthService.BINDING_KEY) private authService: AuthService,
  ) {}

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
  async registerReservations(
    @requestBody() body: NewReservationDTO,
  ): Promise<ReservationDTO> {
    const operatorId = await this.authService.getUsername();
    body.user_id = operatorId;
    return this.reservationService.newReservations(
      operatorId,
      new NewReservationDTO(body),
    );
  }

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
  async getReservations(
    @param.filter(ReservationFilter) filter: Filter<ReservationFilter> = {},
  ): Promise<ReservationsDTO> {
    const operatorId = await this.authService.getUsername();
    return this.reservationService.getReservationsByUserId(operatorId, filter);
  }
}
