import {injectable, BindingScope, BindingKey} from '@loopback/core';
import {Filter, repository} from '@loopback/repository';
import {HotelCalendarRepository, HotelRepository} from '../repositories';
import {
  HotelCalendarDTO,
  HotelCalendarFilter,
  HotelCalendarsDTO,
  NewHotelCalendarDTO,
} from '../dto';
import {adjustMin, adjustRange} from '../helpers';
import {HttpErrors} from '@loopback/rest';

@injectable({scope: BindingScope.APPLICATION})
export class HotelCalendarService {
  static readonly BINDING_KEY = BindingKey.create<HotelCalendarService>(
    `services.${HotelCalendarService.name}`,
  );

  constructor(
    @repository(HotelCalendarRepository)
    private hotelCalendarRepo: HotelCalendarRepository,
    @repository(HotelRepository)
    private hotelRepo: HotelRepository,
  ) {}

  async getHotelCalendarList(
    filter: Filter<HotelCalendarFilter> = {},
  ): Promise<HotelCalendarsDTO> {
    const hotelCalendarList = await this.hotelCalendarRepo.find({
      ...filter,
      where: {...filter.where} as object,
      limit: adjustRange(filter.limit, 0, 100),
      skip: adjustMin(filter.skip, 0),
      offset: adjustMin(filter.offset, 0),
      fields: undefined,
      include: undefined,
    });
    return hotelCalendarList.map(HotelCalendarDTO.fromModel);
  }

  async getHotelCalendar(
    hotelId: string,
    year: number,
  ): Promise<HotelCalendarDTO> {
    const hotelCalendar =
      await this.hotelCalendarRepo.findByHotelIdAndYearOrFail(hotelId, year);
    return HotelCalendarDTO.fromModel(hotelCalendar);
  }

  async getHotelCalendarById(
    hotelCalendarId: string,
  ): Promise<HotelCalendarDTO> {
    const hotelCalendar =
      await this.hotelCalendarRepo.findById(hotelCalendarId);
    return HotelCalendarDTO.fromModel(hotelCalendar);
  }

  async newHotelCalendar(
    operatorId: string,
    data: NewHotelCalendarDTO,
  ): Promise<HotelCalendarDTO> {
    // Check hotel id
    await this.hotelRepo.findById(data.hotel_id);

    // Check for existing data (year)
    const oldActiveCalendare =
      await this.hotelCalendarRepo.findByHotelIdAndYearOrNull(
        data.hotel_id,
        data.year,
      );
    if (oldActiveCalendare) {
      throw new HttpErrors.UnprocessableEntity(
        `Hotel calendar exists for current year, Hotel Id: ${data.hotel_id}, Year: ${data.year}`,
      );
    }
    const hotelCalendar = await this.hotelCalendarRepo.create(
      data.toModel(operatorId),
    );
    return HotelCalendarDTO.fromModel(hotelCalendar);
  }

  async editHotelCalendar(
    operatorId: string,
    hotelCalendarId: string,
    data: NewHotelCalendarDTO,
  ): Promise<HotelCalendarDTO> {
    // Check hotel id
    await this.hotelRepo.findById(data.hotel_id);

    // Get current calendar
    const hotelCalendar =
      await this.hotelCalendarRepo.findById(hotelCalendarId);
    hotelCalendar.update(operatorId, data.toModel(operatorId));
    await this.hotelCalendarRepo.update(hotelCalendar);
    return HotelCalendarDTO.fromModel(hotelCalendar);
  }

  async removeHotelCalendar(
    operatorId: string,
    hotelCalendareId: string,
  ): Promise<void> {
    const hotelCalendar =
      await this.hotelCalendarRepo.findById(hotelCalendareId);
    hotelCalendar.markAsRemoved(operatorId);
    await this.hotelCalendarRepo.update(hotelCalendar);
  }
}
