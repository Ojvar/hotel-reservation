import {inject} from '@loopback/context';
import {HotelCalendarService} from '../services';
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
import {Filter} from '@loopback/repository';

const BASE_ADDR = '/hotels/calendars/';
const tags = ['Hotel.Calendars'];

export class HotelCalendarController {
  constructor(
    @inject(HotelCalendarService.BINDING_KEY)
    private hotelCalendarService: HotelCalendarService,
  ) {}

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
  createNewHotelCalendar(
    @requestBody() body: NewHotelCalendarDTO,
  ): Promise<HotelCalendarDTO> {
    const operatorId = '';
    return this.hotelCalendarService.newHotelCalendar(
      operatorId,
      new NewHotelCalendarDTO(body),
    );
  }

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
  editHotelCalendar(
    @requestBody() body: NewHotelCalendarDTO,
    @param.path.string('hotel_calendar_id') hotelCalendarId: string,
  ): Promise<HotelCalendarDTO> {
    const operatorId = '';
    return this.hotelCalendarService.editHotelCalendar(
      operatorId,
      hotelCalendarId,
      new NewHotelCalendarDTO(body),
    );
  }

  @del(`${BASE_ADDR}/{hotel_calendar_id}`, {
    tags,
    summary: 'Remove calendar of the hotel',
    description: 'Remove calendar of the hotel',
    responses: {204: {}},
  })
  removeHotelCalendar(
    @param.path.string('hotel_calendar_id') hotelCalendarId: string,
  ): Promise<void> {
    const operatorId = '';
    return this.hotelCalendarService.removeHotelCalendar(
      operatorId,
      hotelCalendarId,
    );
  }
}
