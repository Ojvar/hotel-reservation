import {injectable, BindingScope, BindingKey, inject} from '@loopback/core';
import {Filter, IsolationLevel, repository} from '@loopback/repository';
import {ReservationRepository} from '../repositories';
import {
  NewReservationDTO,
  ReservationDTO,
  ReservationFilter,
  ReservationsDTO,
} from '../dto';
import {adjustMin, adjustRange} from '../helpers';
import {HttpErrors} from '@loopback/rest';

export type ReservationServiceConfig = {
  targetWalletId: string;
};

@injectable({scope: BindingScope.APPLICATION})
export class ReservationService {
  static readonly BINDING_KEY = BindingKey.create<ReservationService>(
    `services.${ReservationService.name}`,
  );
  static readonly CONFIG_BINDING_KEY =
    BindingKey.create<ReservationServiceConfig>(
      `services.config.${ReservationService.name}`,
    );

  constructor(
    @inject(ReservationService.CONFIG_BINDING_KEY)
    private configs: ReservationServiceConfig,
    @repository(ReservationRepository)
    private reservationRepo: ReservationRepository,
  ) {}

  async getReservations(
    filter: Filter<ReservationFilter> = {},
  ): Promise<ReservationsDTO> {
    const reservations = await this.reservationRepo.find({
      ...filter,
      where: {...filter.where} as object,
      limit: adjustRange(filter.limit),
      skip: adjustMin(filter.skip),
      offset: adjustMin(filter.offset),
      fields: undefined,
      include: undefined,
    });

    return reservations.map(ReservationDTO.fromModel);
  }

  async getReservationById(reservationId: string): Promise<ReservationDTO> {
    const reservation = await this.reservationRepo.findById(reservationId);
    return ReservationDTO.fromModel(reservation);
  }

  async newReservations(
    operatorId: string,
    data: NewReservationDTO,
  ): Promise<ReservationDTO> {
    const oldReservations = await this.reservationRepo.findConflicts(
      data.hotel_id,
      data.days.map(day => day.date),
    );
    if (oldReservations.length) {
      throw new HttpErrors.UnprocessableEntity(
        'The reservation dates are unavailable',
      );
    }

    // Start Transaction
    const transaction = await this.reservationRepo.dataSource.beginTransaction(
      IsolationLevel.READ_COMMITTED,
    );

    try {
      const reservation = await this.reservationRepo.create(
        data.toModel(operatorId),
        {transaction},
      );

      /// TODO: WITHDRAW FROM E-WALLET, AND MOVE IT TO QENG-WALLET
      console.warn(
        `Move from user ewallet to target ewallet, id -> ${this.configs.targetWalletId}`,
      );

      // Commit Transaction
      await transaction.commit();

      return ReservationDTO.fromModel(reservation);
    } catch (err) {
      await transaction.rollback();

      // Rollback Transaction
      throw new HttpErrors.UnprocessableEntity('Reservation failed!');
    }
  }

  async removeReservation(
    operatorId: string,
    reservationId: string,
  ): Promise<void> {
    const reservation = await this.reservationRepo.findById(reservationId);
    reservation.markAsRemoved(operatorId);
    await this.reservationRepo.update(reservation);
  }
}
