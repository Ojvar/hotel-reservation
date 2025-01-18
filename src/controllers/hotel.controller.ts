import {inject, intercept} from '@loopback/context';
import {Filter} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {HotelDTO, HotelFilter, HotelsDTO, NewHotelDTO} from '../dto';
import {EnumRoles, protect} from '../lib-keycloak/src';
import {AuthService, HotelService} from '../services';
import {FileTokenResponse} from '../lib-file-service/src';

const BASE_ADDR = '/hotels';
const tags = ['Hotel'];

export class HotelController {
  constructor(
    @inject(HotelService.BINDING_KEY) private hotelService: HotelService,
    @inject(AuthService.BINDING_KEY) private authService: AuthService,
  ) {}

  @get(`${BASE_ADDR}/file-token`, {
    tags,
    summary: 'Get file-upload token',
    description: 'Generate an file-upload token',
    responses: {
      200: {
        description: 'Get an upload file token',
        content: {
          'application/json': {schema: getModelSchemaRef(FileTokenResponse)},
        },
      },
    },
  })
  async getFileToken(): Promise<FileTokenResponse> {
    const operatorId = await this.authService.getUsername();
    return this.hotelService.getFileToken(operatorId);
  }

  @intercept(protect(EnumRoles.NO_BODY))
  @get(`${BASE_ADDR}`, {
    tags,
    summary: 'Get hotels list',
    description: 'Get hotels list',
    responses: {
      200: {
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(HotelDTO)},
          },
        },
      },
    },
  })
  getHotelList(
    @param.filter(HotelFilter) filter: Filter<HotelFilter> = {},
  ): Promise<HotelsDTO> {
    return this.hotelService.getHotelsList(filter);
  }

  @intercept(protect(EnumRoles.NO_BODY))
  @get(`${BASE_ADDR}/{hote_id}`, {
    tags,
    summary: 'Get hotel detail',
    description: 'Get hotel detail',
    responses: {
      200: {
        content: {'application/json': {schema: getModelSchemaRef(HotelDTO)}},
      },
    },
  })
  getHotelDetail(
    @param.path.string('hote_id') hotelId: string,
  ): Promise<HotelDTO> {
    return this.hotelService.getHotelById(hotelId);
  }

  @intercept(protect(EnumRoles.RESERVATION_MANAGER))
  @post(`${BASE_ADDR}`, {
    tags,
    summary: 'Create a new hotel',
    description: 'Create a new hotel',
    responses: {
      200: {
        content: {'application/json': {schema: getModelSchemaRef(HotelDTO)}},
      },
    },
  })
  async createNewHotel(
    @requestBody() body: NewHotelDTO,
    @param.header.string('file-token') fileToken: string = '',
  ): Promise<HotelDTO> {
    const operatorId = await this.authService.getUsername();
    return this.hotelService.newHotel(
      operatorId,
      new NewHotelDTO(body),
      fileToken,
    );
  }

  @intercept(protect(EnumRoles.RESERVATION_MANAGER))
  @patch(`${BASE_ADDR}/{hotel_id}`, {
    tags,
    summary: 'Edit a hotel',
    description: 'Edit a hotel',
    responses: {
      200: {
        content: {'application/json': {schema: getModelSchemaRef(HotelDTO)}},
      },
    },
  })
  async updateHotel(
    @requestBody() body: NewHotelDTO,
    @param.header.string('file-token') fileToken: string = '',
    @param.path.string('hote_id') hotelId: string,
  ): Promise<HotelDTO> {
    const operatorId = await this.authService.getUsername();
    return this.hotelService.updateHotel(
      operatorId,
      hotelId,
      new NewHotelDTO(body),
      fileToken,
    );
  }

  @intercept(protect(EnumRoles.RESERVATION_MANAGER))
  @del(`${BASE_ADDR}/{hotel_id}`, {
    tags,
    summary: 'Delete a hotel',
    description: 'Delete a hotel',
    responses: {204: {}},
  })
  async removeHotel(
    @param.path.string('hote_id') hotelId: string,
  ): Promise<void> {
    const operatorId = await this.authService.getUsername();
    return this.hotelService.removeHotel(operatorId, hotelId);
  }
}
