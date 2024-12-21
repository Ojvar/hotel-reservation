/* eslint-disable @typescript-eslint/naming-convention */
import {Entity, model, property, belongsTo, Model} from '@loopback/repository';
import {Hotel} from './hotel.model';
import {EnumStatus, EnumStatusValues, ModifyStamp} from './common.model';

@model()
export class HotelCalendarDay extends Model {
  @property({type: 'date', required: true})
  day: Date;
  @property({type: 'number', required: true})
  price: number;

  constructor(data?: Partial<HotelCalendarDay>) {
    super(data);
  }
}
export type HotelCalendarDays = HotelCalendarDay[];
export type HotelCalendarMeta = Record<string, string | number>;

@model({
  name: 'hotel_calendars',
  settings: {indexes: [{key: 'hote_id', options: {unique: true}}]},
})
export class HotelCalendar extends Entity {
  @property({type: 'string', id: true, generated: true})
  id?: string;
  @property({required: true})
  created: ModifyStamp;
  @property({required: true})
  updated: ModifyStamp;
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
  @property.array(HotelCalendarDay, {required: false, default: []})
  days?: HotelCalendarDays;

  @belongsTo(() => Hotel, {name: 'hotel'})
  hotel_id: string;

  constructor(data?: Partial<HotelCalendar>) {
    super(data);
    this.days = this.days?.map(day => new HotelCalendarDay(day));
  }

  markAsRemoved(operatorId: string): void {
    this.updated = new ModifyStamp({by: operatorId});
    this.status = EnumStatus.DEACTIVE;
  }

  update(operatorId: string, data: HotelCalendar): void {
    this.updated = new ModifyStamp({by: operatorId});
    this.days = data.days?.map(day => new HotelCalendarDay(day));
    this.meta = data.meta ?? {};
    this.title = data.title;
    this.description = data.description;
  }
}

export interface HotelCalendarRelations {
  hotel?: Hotel;
}
export type HotelCalendarWithRelations = HotelCalendar & HotelCalendarRelations;
