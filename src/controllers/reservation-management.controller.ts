import {inject} from '@loopback/context';
import {ReservationManagementService} from '../services';
import {param, patch} from '@loopback/rest';
import {KeycloakSecurity, KeycloakSecurityProvider} from '../lib-keycloak/src';

const BASE_ADDR = '/reservation-management/';
const tags = ['Reservation.Management'];

export class ReservationManagementController {
  constructor(
    @inject(KeycloakSecurityProvider.BINDING_KEY)
    private keycloakSecurity: KeycloakSecurity,
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
    const {sub: operatorId} =
      {sub: '676193da5fc74dacf315a62b'} ||
      (await this.keycloakSecurity.getUserInfo());
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
    const {sub: operatorId} =
      {sub: '676193da5fc74dacf315a62b'} ||
      (await this.keycloakSecurity.getUserInfo());
    return this.reservationManagementService.rejectReservation(
      operatorId,
      reservationId,
    );
  }
}
