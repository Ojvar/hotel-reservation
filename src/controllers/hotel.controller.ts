import {inject} from '@loopback/context';
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
import {KeycloakSecurity, KeycloakSecurityProvider} from '../lib-keycloak/src';
import {HotelService} from '../services';

const BASE_ADDR = '/hotels';
const tags = ['Hotel'];

export class HotelController {
  constructor(
    @inject(HotelService.BINDING_KEY) private hotelService: HotelService,
    @inject(KeycloakSecurityProvider.BINDING_KEY)
    private keycloakSecurity: KeycloakSecurity,
  ) {}

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
  async createNewHotel(@requestBody() body: NewHotelDTO): Promise<HotelDTO> {
    const {sub: operatorId} =
      {sub: '676193da5fc74dacf315a62b'} ||
      (await this.keycloakSecurity.getUserInfo());
    return this.hotelService.newHotel(operatorId, new NewHotelDTO(body));
  }

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
    @param.path.string('hote_id') hotelId: string,
  ): Promise<HotelDTO> {
    const {sub: operatorId} =
      {sub: '676193da5fc74dacf315a62b'} ||
      (await this.keycloakSecurity.getUserInfo());
    return this.hotelService.updateHotel(
      operatorId,
      hotelId,
      new NewHotelDTO(body),
    );
  }

  @del(`${BASE_ADDR}/{hotel_id}`, {
    tags,
    summary: 'Delete a hotel',
    description: 'Delete a hotel',
    responses: {204: {}},
  })
  async removeHotel(
    @param.path.string('hote_id') hotelId: string,
  ): Promise<void> {
    const {sub: operatorId} =
      {sub: '676193da5fc74dacf315a62b'} ||
      (await this.keycloakSecurity.getUserInfo());
    return this.hotelService.removeHotel(operatorId, hotelId);
  }
}
