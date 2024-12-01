import {Model, model, property} from '@loopback/repository';
import {
  CalendarDayItem,
  EnumStatus,
  EnumStatusValues,
  Reservation,
  ReservationWithRelations,
} from '../models';
import {HotelDTO} from './hotel.dto';
import {DiscountDTO} from './discount.dto';

@model()
export class CalendarDayItemDTO extends Model {
  @property({type: 'date', required: true})
  date: Date;
  @property({type: 'number', required: true})
  value: number;

  constructor(data?: Partial<CalendarDayItemDTO>) {
    super(data);
  }

  static fromModel(data: CalendarDayItem): CalendarDayItemDTO {
    return new CalendarDayItemDTO({
      value: data.value,
      date: new Date(data.date),
    });
  }
}
export type CalendarDayItemsDTO = CalendarDayItemDTO[];

@model()
export class ReservationDTO extends Model {
  @property({type: 'string'})
  id?: string;
  @property({type: 'date', required: true})
  created_at: Date;
  @property({type: 'date', required: true})
  updated_at: Date;
  @property({
    type: 'number',
    required: true,
    jsonSchema: {enum: EnumStatusValues},
  })
  status: EnumStatus;
  @property({type: 'string', required: true})
  user_id: string;
  @property.array(CalendarDayItemDTO, {required: true})
  days: CalendarDayItemsDTO;
  @property({type: 'number', required: true})
  total: number;
  @property({type: 'number'})
  paied?: number;
  @property({type: 'string', required: false})
  transaction_id?: string;

  @property({type: 'string'})
  hotel_id: string;
  @property({type: 'string'})
  discount_id?: string;

  @property({})
  hotel?: HotelDTO;
  @property({})
  discount?: DiscountDTO;

  constructor(data?: Partial<ReservationDTO>) {
    super(data);
  }

  static fromModel(data: ReservationWithRelations): ReservationDTO {
    return new ReservationDTO({
      id: data.id?.toString(),
      created_at: data.created.at,
      updated_at: data.updated.at,
      status: data.status,
      user_id: data.user_id,
      days: data.days.map(CalendarDayItemDTO.fromModel),
      total: data.total,
      paied: data.paied,
      transaction_id: data.transaction_id,
      hotel_id: data.hotel_id,
      discount_id: data.discount_id,
      hotel: data.hotel ? HotelDTO.fromModel(data.hotel) : undefined,
      discount: data.discount
        ? DiscountDTO.fromModel(data.discount)
        : undefined,
    });
  }
}
export type ReservationsDTO = ReservationDTO[];
