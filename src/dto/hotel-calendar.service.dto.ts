/* eslint-disable @typescript-eslint/naming-convention */
import {Model, model, property} from '@loopback/repository';
import {
  EnumStatus,
  EnumStatusValues,
  HotelCalendar,
  HotelCalendarDay,
  HotelCalendarWithRelations,
  ModifyStamp,
} from '../models';
import {HotelDTO} from './hotel.service.dto';

@model()
export class HotelCalendarFilter extends Model {
  @property({type: 'string'})
  hotel_id?: string;
  @property({type: 'string'})
  year?: number;
  @property({type: 'string'})
  status?: EnumStatus;

  constructor(data?: Partial<HotelCalendarFilter>) {
    super(data);
  }
}

export type HotelCalendarMeta = Record<string, string | number>;

@model()
export class NewHotelCalendarDayDTO extends Model {
  @property({type: 'date', required: true})
  day: Date;
  @property({type: 'number', required: true})
  price: number;

  constructor(data?: Partial<NewHotelCalendarDayDTO>) {
    super(data);
  }

  toModel(): HotelCalendarDay {
    return new HotelCalendarDay({day: new Date(this.day), price: this.price});
  }
}
export type NewHotelCalendarDaysDTO = NewHotelCalendarDayDTO[];

@model()
export class NewHotelCalendarDTO extends Model {
  @property({type: 'string', required: true})
  title: string;
  @property({type: 'string'})
  description?: string;
  @property({type: 'object', default: {}})
  meta?: HotelCalendarMeta;
  @property.array(NewHotelCalendarDayDTO, {default: []})
  days?: NewHotelCalendarDaysDTO;
  @property({type: 'number', required: true})
  year: number;
  @property({type: 'string'})
  hotel_id: string;

  constructor(data?: Partial<HotelCalendarDTO>) {
    super(data);
    this.days = this.days?.map(day => new NewHotelCalendarDayDTO(day));
  }

  toModel(operatorId: string): HotelCalendar {
    const now = new ModifyStamp({by: operatorId});
    return new HotelCalendar({
      status: EnumStatus.ACTIVE,
      created: now,
      updated: now,
      title: this.title,
      description: this.description,
      meta: this.meta ?? {},
      days: this.days?.map(HotelCalendarDayDTO.fromModel),
      hotel_id: this.hotel_id,
      year: this.year,
    });
  }
}

@model()
export class HotelCalendarDayDTO extends Model {
  @property({type: 'date', required: true})
  day: Date;
  @property({type: 'number', required: true})
  price: number;

  constructor(data?: Partial<HotelCalendarDayDTO>) {
    super(data);
  }

  static fromModel(data: HotelCalendarDay): HotelCalendarDayDTO {
    return new HotelCalendarDayDTO({day: data.day, price: data.price});
  }
}
export type HotelCalendarDaysDTO = HotelCalendarDayDTO[];

@model()
export class HotelCalendarDTO extends Model {
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
  title: string;
  @property({type: 'string'})
  description?: string;
  @property({type: 'number', required: true})
  year: number;
  @property({type: 'object', default: {}})
  meta?: HotelCalendarMeta;
  @property.array(HotelCalendarDayDTO, {required: false, default: []})
  days?: HotelCalendarDaysDTO;

  @property({type: 'string'})
  hotel_id: string;
  @property({required: false})
  hotel?: HotelDTO;

  constructor(data?: Partial<HotelCalendarDTO>) {
    super(data);
  }

  static fromModel(data: HotelCalendarWithRelations): HotelCalendarDTO {
    return new HotelCalendarDTO({
      id: data.id?.toString(),
      created_at: data.created.at,
      updated_at: data.updated.at,
      status: data.status,
      title: data.title,
      description: data.description,
      meta: data.meta ?? {},
      days: data.days?.map(HotelCalendarDayDTO.fromModel),
      hotel_id: data.hotel_id,
      hotel: data.hotel ? HotelDTO.fromModel(data.hotel) : undefined,
      year: data.year,
    });
  }
}
export type HotelCalendarsDTO = HotelCalendarDTO[];
