import {injectable, BindingScope, BindingKey, inject} from '@loopback/core';
import {Filter, repository} from '@loopback/repository';
import {HotelRepository} from '../repositories';
import {HotelDTO, HotelFilter, HotelsDTO, NewHotelDTO} from '../dto';
import {EnumStatus} from '../models';
import {adjustMin, adjustRange} from '../helpers';
import {FileServiceAgentService} from './file-agent.service';
import {FileTokenResponse} from '../lib-file-service/src';
import {OperationVisibility} from '@loopback/rest';

@injectable({scope: BindingScope.APPLICATION})
export class HotelService {
  static readonly BINDING_KEY = BindingKey.create<HotelService>(
    `services.${HotelService.name}`,
  );

  static readonly ATTACHMENTS: string[] = Array(10)
    .fill(0)
    .map(index => `image_${index}`);

  constructor(
    @repository(HotelRepository) private hotelRepo: HotelRepository,
    @inject(FileServiceAgentService.BINDING_KEY)
    private fileAgentService: FileServiceAgentService,
  ) {}

  async getFileToken(userId: string): Promise<FileTokenResponse> {
    const allowedFiles = HotelService.ATTACHMENTS.map(x =>
      FileServiceAgentService.generateAllowedFile(x),
    );
    return this.fileAgentService.getFileToken(allowedFiles, userId);
  }

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

  async newHotel(
    operatorId: string,
    newData: NewHotelDTO,
    fileToken: string,
  ): Promise<HotelDTO> {
    if (fileToken) {
      const [items] = await this.fileAgentService.getAttachmentsLocal(
        fileToken,
      );
      newData.attachments = items;
    }
    const hotel = await this.hotelRepo.create(newData.toModel(operatorId));

    // Commit uploaded files
    if (fileToken) {
      await this.fileAgentService.commit(operatorId, fileToken);
    }

    return HotelDTO.fromModel(hotel);
  }

  async updateHotel(
    operatorId: string,
    hotelId: string,
    hotelData: NewHotelDTO,
    fileToken: string,
  ): Promise<HotelDTO> {
    const hotel = await this.hotelRepo.findById(hotelId);
    if (fileToken) {
      const [items] = await this.fileAgentService.getAttachmentsLocal(
        fileToken,
      );
      hotelData.attachments = {...hotelData.attachments, ...items};
    }
    hotel.update(operatorId, hotelData.toModel(operatorId));
    await this.hotelRepo.update(hotel);
    // Commit uploaded files
    if (fileToken) {
      await this.fileAgentService.commit(operatorId, fileToken);
    }
    return HotelDTO.fromModel(hotel);
  }

  async removeHotel(operatorId: string, hotelId: string): Promise<void> {
    const hotel = await this.hotelRepo.findById(hotelId);
    hotel.markAsRemoved(operatorId);
    await this.hotelRepo.update(hotel);
  }
}
