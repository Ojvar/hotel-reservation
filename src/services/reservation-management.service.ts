import {injectable, BindingScope, BindingKey} from '@loopback/core';
import {repository} from '@loopback/repository';
import {ReservationRepository} from '../repositories';

@injectable({scope: BindingScope.APPLICATION})
export class ReservationManagementService {
  static readonly BINDING_KEY = BindingKey.create<ReservationManagementService>(
    `services.${ReservationManagementService.name}`,
  );

  constructor(
    @repository(ReservationRepository)
    private reservationRepo: ReservationRepository,
  ) {}

  async confirmReservation(
    operatorId: string,
    reservationId: string,
  ): Promise<void> {
    const reservation = await this.reservationRepo.findById(reservationId);
    reservation.confirm(operatorId);
    await this.reservationRepo.update(reservation);
  }

  async rejectReservation(
    operatorId: string,
    reservationId: string,
  ): Promise<void> {
    const reservation = await this.reservationRepo.findById(reservationId);
    reservation.reject(operatorId);
    await this.reservationRepo.update(reservation);
  }
}
