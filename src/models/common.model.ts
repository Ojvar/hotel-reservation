import {Model, model, property} from '@loopback/repository';

export enum EnumStatus {
  ACTIVE = 6,
  DEACTIVE = 7,
}
export const EnumStatusValues = Object.values(EnumStatus);

@model()
export class CalendarDayItem extends Model {
  @property({type: 'date', required: true})
  date: Date;
  @property({type: 'number', required: true})
  value: number;

  constructor(data?: Partial<CalendarDayItem>) {
    super(data);
  }
}
export type CalendarDayItems = CalendarDayItem[];
