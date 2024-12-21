import {inject} from '@loopback/context';
import {Filter} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  post,
  requestBody,
} from '@loopback/rest';
import {
  NewReservationDTO,
  ReservationDTO,
  ReservationFilter,
  ReservationsDTO,
} from '../dto';
import {KeycloakSecurity, KeycloakSecurityProvider} from '../lib-keycloak/src';
import {ReservationService} from '../services';

const BASE_ADDR = '/reservations/';
const tags = ['Reservations'];

export class ReservationController {
  constructor(
    @inject(ReservationService.BINDING_KEY)
    private reservationService: ReservationService,
    @inject(KeycloakSecurityProvider.BINDING_KEY)
    private keycloakSecurity: KeycloakSecurity,
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
  async registerReservations(
    @requestBody() body: NewReservationDTO,
  ): Promise<ReservationDTO> {
    const {sub: operatorId} =
      {sub: '676193da5fc74dacf315a62b'} ||
      (await this.keycloakSecurity.getUserInfo());
    body.user_id = operatorId;
    return this.reservationService.newReservations(
      operatorId,
      new NewReservationDTO(body),
    );
  }

  @del(`${BASE_ADDR}/{reservation_id}`, {
    tags,
    summary: 'Remove reservation',
    description: 'Remove reservation',
    responses: {204: {}},
  })
  async removeReservation(
    @param.path.string('reservation_id') reservationId: string,
  ): Promise<void> {
    const {sub: operatorId} =
      {sub: '676193da5fc74dacf315a62b'} ||
      (await this.keycloakSecurity.getUserInfo());
    return this.reservationService.removeReservation(operatorId, reservationId);
  }
}
