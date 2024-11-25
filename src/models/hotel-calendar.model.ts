/* eslint-disable @typescript-eslint/naming-convention */
import {Entity, model, property} from '@loopback/repository';

@model()
export class HotelCalendar extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  hotel_id: string;

  @property({
    type: 'array',
    itemType: 'object',
    default: [],
  })
  days?: object[];

  @property({
    type: 'number',
    required: true,
  })
  status: number;

  @property({
    type: 'string',
    required: true,
  })
  title: string;

  @property({
    type: 'string',
  })
  description?: string;

  @property({
    type: 'object',
    default: {},
  })
  meta?: object;

  constructor(data?: Partial<HotelCalendar>) {
    super(data);
  }
}

export interface HotelCalendarRelations {
  // describe navigational properties here
}

export type HotelCalendarWithRelations = HotelCalendar & HotelCalendarRelations;
