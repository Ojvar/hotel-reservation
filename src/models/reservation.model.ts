/* eslint-disable @typescript-eslint/naming-convention */
import {Entity, model, property} from '@loopback/repository';
import {CalendarDayItem, CalendarDayItems} from './common.model';

@model()
export class Reservation extends Entity {
  @property({type: 'string', id: true, generated: true})
  id?: string;

  @property({type: 'string', required: true})
  hotel_id: string;

  @property({type: 'string', required: true})
  user_id: string;

  @property.array(CalendarDayItem, {required: true})
  days: CalendarDayItems;

  @property({
    type: 'string',
  })
  discount_id?: string;

  @property({type: 'number', required: true})
  total_value: number;

  @property({type: 'number', default: 0})
  discount_value?: number;

  @property({type: 'string', required: false})
  transaction_id?: string;

  constructor(data?: Partial<Reservation>) {
    super(data);
  }
}

export interface ReservationRelations {}
export type ReservationWithRelations = Reservation & ReservationRelations;
