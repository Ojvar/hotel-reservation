import {BindingKey, BindingScope, injectable} from '@loopback/core';
import {Filter, repository} from '@loopback/repository';
import {ReservationDTO, ReservationFilter, ReservationsDTO} from '../dto';
import {adjustMin, adjustRange} from '../helpers';
import {Reservation} from '../models';
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

  async reservationsList(
    filter: Filter<ReservationFilter> = {},
  ): Promise<ReservationsDTO> {
    filter = {
      where: {...filter?.where},
      limit: adjustRange(filter?.limit ?? 100),
      skip: adjustMin(filter?.skip ?? 0),
      offset: adjustMin(filter?.offset ?? 0),
      order: ['created.at desc'],
      fields: undefined,
      include: undefined,
    };
    const reservations = await this.reservationRepo.find(
      filter as Filter<Reservation>,
    );
    return reservations.map(ReservationDTO.fromModel);
  }
}
