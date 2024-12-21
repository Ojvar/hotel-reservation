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
import {
  HotelCalendarDTO,
  HotelCalendarFilter,
  HotelCalendarsDTO,
  NewHotelCalendarDTO,
} from '../dto';
import {EnumRoles, protect} from '../lib-keycloak/src';
import {AuthService, HotelCalendarService} from '../services';

const BASE_ADDR = '/hotels/calendars/';
const tags = ['Hotel.Calendars'];

export class HotelCalendarController {
  constructor(
    @inject(HotelCalendarService.BINDING_KEY)
    private hotelCalendarService: HotelCalendarService,
    @inject(AuthService.BINDING_KEY) private authService: AuthService,
  ) {}

  @intercept(protect(EnumRoles.NO_BODY))
  @get(`${BASE_ADDR}`, {
    tags,
    summary: 'Get hotel calendars list',
    description: 'Get hotel calendars list',
    responses: {
      200: {
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(HotelCalendarDTO)},
          },
        },
      },
    },
  })
  getHotelCalendars(
    @param.filter(HotelCalendarFilter) filter?: Filter<HotelCalendarFilter>,
  ): Promise<HotelCalendarsDTO> {
    return this.hotelCalendarService.getHotelCalendarList(filter);
  }

  @intercept(protect(EnumRoles.NO_BODY))
  @get(`${BASE_ADDR}/{hotel_calendar_id}`, {
    tags,
    summary: 'Get hotel calendar data',
    description: 'Get hotel calendar data',
    responses: {
      200: {
        content: {
          'application/json': {schema: getModelSchemaRef(HotelCalendarDTO)},
        },
      },
    },
  })
  getHotelCalendarById(
    @param.path.string('hotel_calendar_id') hotelCalendarId: string,
  ): Promise<HotelCalendarDTO> {
    return this.hotelCalendarService.getHotelCalendarById(hotelCalendarId);
  }

  @intercept(protect(EnumRoles.NO_BODY))
  @get(`${BASE_ADDR}/find/{hotel_id}/{year}`, {
    tags,
    summary: 'Get calendar data by hotel and year',
    description: 'Get calendar data by hotel and year',
    responses: {
      200: {
        content: {
          'application/json': {schema: getModelSchemaRef(HotelCalendarDTO)},
        },
      },
    },
  })
  getHotelCalendarByHotelIdAndYear(
    @param.path.string('hotel_id') hotelId: string,
    @param.path.number('year') year: number,
  ): Promise<HotelCalendarDTO> {
    return this.hotelCalendarService.getHotelCalendar(hotelId, year);
  }

  @intercept(protect(EnumRoles.RESERVATION_MANAGER))
  @post(`${BASE_ADDR}`, {
    tags,
    summary: 'Create calendar for hotel',
    description: 'Create calendar for hotel',
    responses: {
      200: {
        content: {
          'application/json': {schema: getModelSchemaRef(HotelCalendarDTO)},
        },
      },
    },
  })
  async createNewHotelCalendar(
    @requestBody() body: NewHotelCalendarDTO,
  ): Promise<HotelCalendarDTO> {
    const operatorId = await this.authService.getUsername();
    return this.hotelCalendarService.newHotelCalendar(
      operatorId,
      new NewHotelCalendarDTO(body),
    );
  }

  @intercept(protect(EnumRoles.RESERVATION_MANAGER))
  @patch(`${BASE_ADDR}/{hotel_calendar_id}`, {
    tags,
    summary: 'Edit calendar of the hotel',
    description: 'Edit calendar of the hotel',
    responses: {
      200: {
        content: {
          'application/json': {schema: getModelSchemaRef(HotelCalendarDTO)},
        },
      },
    },
  })
  async editHotelCalendar(
    @requestBody() body: NewHotelCalendarDTO,
    @param.path.string('hotel_calendar_id') hotelCalendarId: string,
  ): Promise<HotelCalendarDTO> {
    const operatorId = await this.authService.getUsername();
    return this.hotelCalendarService.editHotelCalendar(
      operatorId,
      hotelCalendarId,
      new NewHotelCalendarDTO(body),
    );
  }

  @intercept(protect(EnumRoles.RESERVATION_MANAGER))
  @del(`${BASE_ADDR}/{hotel_calendar_id}`, {
    tags,
    summary: 'Remove calendar of the hotel',
    description: 'Remove calendar of the hotel',
    responses: {204: {}},
  })
  async removeHotelCalendar(
    @param.path.string('hotel_calendar_id') hotelCalendarId: string,
  ): Promise<void> {
    const operatorId = await this.authService.getUsername();
    return this.hotelCalendarService.removeHotelCalendar(
      operatorId,
      hotelCalendarId,
    );
  }
}
