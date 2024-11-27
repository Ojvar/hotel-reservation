/* eslint-disable @typescript-eslint/naming-convention */
import {Entity, model, property, belongsTo} from '@loopback/repository';
import {
  CalendarDayItem,
  CalendarDayItems,
  EnumStatus,
  EnumStatusValues,
  ModifyStamp,
} from './common.model';
import {Hotel} from './hotel.model';
import {Discount} from './discount.model';

@model({
  name: 'reservations',
  settings: {indexes: [{key: 'user_id', options: {unique: true}}]},
})
export class Reservation extends Entity {
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
  user_id: string;
  @property.array(CalendarDayItem, {required: true})
  days: CalendarDayItems;
  @property({type: 'number', required: true})
  total: number;
  @property({type: 'number'})
  paied?: number;
  @property({type: 'string', required: false})
  transaction_id?: string;

  @belongsTo(() => Hotel, {name: 'hotel'}, {required: true})
  hotel_id: string;
  @belongsTo(() => Discount, {name: 'discount'}, {required: false})
  discount_id?: string;

  constructor(data?: Partial<Reservation>) {
    super(data);
  }
}

export interface ReservationRelations {
  hotel?: Hotel;
  discount?: Discount;
}
export type ReservationWithRelations = Reservation & ReservationRelations;
