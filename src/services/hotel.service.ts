import {injectable, BindingScope, BindingKey} from '@loopback/core';
import {Filter, repository} from '@loopback/repository';
import {HotelRepository} from '../repositories';
import {HotelDTO, HotelFilter, HotelsDTO, NewHotelDTO} from '../dto';
import {EnumStatus} from '../models';
import {adjustMin, adjustRange} from '../helpers';

@injectable({scope: BindingScope.APPLICATION})
export class HotelService {
  static readonly BINDING_KEY = BindingKey.create<HotelService>(
    `services.${HotelService.name}`,
  );

  constructor(
    @repository(HotelRepository) private hotelRepo: HotelRepository,
  ) {}

  async getHotelsList(filter?: Filter<HotelFilter>): Promise<HotelsDTO> {
    filter = {
      ...filter,
      where: {status: EnumStatus.ACTIVE, ...filter?.where},
      limit: adjustRange(filter?.limit, 0, 100),
      skip: adjustMin(filter?.skip, 0),
      offset: adjustMin(filter?.offset, 0),
      include: undefined,
      fields: undefined,
    };

    const result = await this.hotelRepo.find(filter as object);
    return result.map(HotelDTO.fromModel);
  }

  async getHotelById(hotelId: string): Promise<HotelDTO> {
    const hotel = await this.hotelRepo.findById(hotelId);
    return HotelDTO.fromModel(hotel);
  }

  async newHotel(operatorId: string, newData: NewHotelDTO): Promise<HotelDTO> {
    const hotel = await this.hotelRepo.create(newData.toModel(operatorId));
    return HotelDTO.fromModel(hotel);
  }

  async updateHotel(
    operatorId: string,
    hotelId: string,
    hotelData: NewHotelDTO,
  ): Promise<HotelDTO> {
    const hotel = await this.hotelRepo.findById(hotelId);
    hotel.update(operatorId, hotelData.toModel(operatorId));
    await this.hotelRepo.update(hotel);
    return HotelDTO.fromModel(hotel);
  }

  async removeHotel(operatorId: string, hotelId: string): Promise<void> {
    const hotel = await this.hotelRepo.findById(hotelId);
    hotel.markAsRemoved(operatorId);
    await this.hotelRepo.update(hotel);
  }
}
