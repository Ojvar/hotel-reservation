/* eslint-disable @typescript-eslint/naming-convention */
import {injectable, BindingScope, BindingKey, inject} from '@loopback/core';
import {Filter, IsolationLevel, repository} from '@loopback/repository';
import {
  BaseDataRepository,
  HotelCalendarRepository,
  HotelRepository,
  ReservationRepository,
} from '../repositories';
import {
  NewReservationDTO,
  ReservationDTO,
  ReservationFilter,
  ReservationsDTO,
} from '../dto';
import {adjustMin, adjustRange} from '../helpers';
import {HttpErrors} from '@loopback/rest';
import {Ewallet, EwalletProvider, TransferResult} from './ewallet.service';
import {HotelCalendar, Reservation} from '../models';
import {KeycloakAgentService} from '../lib-keycloak/src';

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

  static readonly RESERVE_ZONE = 'RESERVE_ZONE';

  constructor(
    @repository(BaseDataRepository) private basedataRepo: BaseDataRepository,
    @inject(ReservationService.CONFIG_BINDING_KEY)
    private configs: ReservationServiceConfig,
    @inject(EwalletProvider.BINDING_KEY) private ewallet: Ewallet,
    @inject(KeycloakAgentService.BINDING_KEY)
    private keycloakAgentService: KeycloakAgentService,
    @repository(ReservationRepository)
    private reservationRepo: ReservationRepository,
    @repository(HotelCalendarRepository)
    private hotelCalendarRepo: HotelCalendarRepository,
    @repository(HotelRepository)
    private hotelRepo: HotelRepository,
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

  async getReservationsByUserId(
    userId: string,
    filter: Filter<ReservationFilter> = {},
  ): Promise<ReservationsDTO> {
    const reservations = await this.reservationRepo.find({
      ...filter,
      where: {...filter.where, user_id: userId} as object,
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
    await this.checkConflicts(data.user_id, data.hotel_id, data.days);

    const transaction = await this.reservationRepo.dataSource.beginTransaction(
      IsolationLevel.READ_COMMITTED,
    );
    try {
      const hotelCalendar = await this.getHotelCalendar(
        data.hotel_id,
        data.year,
      );
      const total = await this.calcReservationAmount(hotelCalendar, data.days);

      // TODO: Fetch discount record from database
      const discount = 0;

      const paied = total - discount;
      const reservation = await this.reservationRepo.create(
        {...data.toModel(operatorId), total, paied},
        {transaction},
      );

      if (process.env.NO_MONEY_TRANSFER !== 'false') {
        await this.transferMoney(reservation);
      }

      await transaction.commit();
      return ReservationDTO.fromModel(reservation);
    } catch (err) {
      await transaction.rollback();
      console.error(err);
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

  private async checkConflicts(
    userId: string,
    hotelId: string,
    days: Date[],
  ): Promise<void> {
    const hotel = await this.hotelRepo.findById(hotelId);

    // Find reservation conflicts
    const oldReservations = await this.reservationRepo.findConflicts(
      userId,
      hotel,
      days,
    );
    if (oldReservations.length) {
      throw new HttpErrors.UnprocessableEntity(
        'The reservation dates are unavailable',
      );
    }

    // Check maximum reservation date length
    const basedata = await this.basedataRepo.findByCategory(
      ReservationService.RESERVE_ZONE,
    );
    const {max_days: maxZoneReserveLength = 0} = basedata.meta ?? {max_days: 0};
    const maxDays = this.getMaxRepeationsOfDates(days);
    if (maxDays > +maxZoneReserveLength) {
      throw new HttpErrors.UnprocessableEntity('Invaliad reservation length');
    }
  }

  private getMaxRepeationsOfDates(days: Date[]): number {
    const datesByMonth = days.reduce<Record<string, number>>((res, day) => {
      const month = new Date(day).getMonth();
      return {...res, [month]: (res[month] ?? 0) + 1};
    }, {});
    return Object.values(datesByMonth).sort().at(-1) ?? 0;
  }

  private getHotelCalendar(
    hotelId: string,
    year: number,
  ): Promise<HotelCalendar> {
    return this.hotelCalendarRepo.findByHotelIdAndYearOrFail(hotelId, year);
  }

  private async calcReservationAmount(
    hotelCalendar: HotelCalendar,
    selectedDays: Date[],
  ): Promise<number> {
    const daysAsNumber = selectedDays.map(date => +new Date(date));
    const days = hotelCalendar.days?.filter(day =>
      daysAsNumber.includes(+new Date(day.day)),
    );
    if (days?.length !== selectedDays.length) {
      throw new HttpErrors.UnprocessableEntity(
        'Days information are not defined',
      );
    }
    return days.reduce((total, day) => total + day.price, 0) ?? -1;
  }

  private async transferMoney(
    reservation: Reservation,
  ): Promise<TransferResult> {
    const sourceEWalletUserId = reservation.user_id;
    const targetEWalletUserId = this.configs.targetWalletId;

    const {access_token: token} =
      await this.keycloakAgentService.getAdminToken();
    return this.ewallet.transfer(
      token,
      sourceEWalletUserId,
      targetEWalletUserId,
      reservation.total,
      '',
      {tags: ['RESERVATION']},
    );
  }
}
