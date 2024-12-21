import {inject, intercept} from '@loopback/context';
import {Filter} from '@loopback/repository';
import {get, getModelSchemaRef, param, patch} from '@loopback/rest';
import {ReservationDTO, ReservationFilter, ReservationsDTO} from '../dto';
import {EnumRoles, protect} from '../lib-keycloak/src';
import {AuthService, ReservationManagementService} from '../services';

const BASE_ADDR = '/reservation-management/';
const tags = ['Reservation.Management'];

@intercept(protect(EnumRoles.RESERVATION_MANAGER))
export class ReservationManagementController {
  constructor(
    @inject(AuthService.BINDING_KEY) private authService: AuthService,
    @inject(ReservationManagementService.BINDING_KEY)
    private reservationManagementService: ReservationManagementService,
  ) {}

  @patch(`${BASE_ADDR}/{reservation_id}/accept`, {
    tags,
    summary: 'Accept reservation',
    description: 'Accept reservation',
    responses: {204: {}},
  })
  async acceptReservation(
    @param.path.string('reservation_id') reservationId: string,
  ): Promise<void> {
    const operatorId = await this.authService.getUsername();
    return this.reservationManagementService.confirmReservation(
      operatorId,
      reservationId,
    );
  }

  @patch(`${BASE_ADDR}/{reservation_id}/reject`, {
    tags,
    summary: 'Reject reservation',
    description: 'Reject reservation',
    responses: {204: {}},
  })
  async rejectReservation(
    @param.path.string('reservation_id') reservationId: string,
  ): Promise<void> {
    const operatorId = await this.authService.getUsername();
    return this.reservationManagementService.rejectReservation(
      operatorId,
      reservationId,
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
  reservationsList(
    @param.filter(ReservationFilter) filter: Filter<ReservationFilter> = {},
  ): Promise<ReservationsDTO> {
    return this.reservationManagementService.reservationsList(filter);
  }
}
