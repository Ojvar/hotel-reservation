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

@model()
export class ModifyStamp extends Model {
  @property({type: 'date', required: true})
  at: Date;
  @property({type: 'string', required: true})
  by: string;

  constructor(data?: Partial<ModifyStamp>) {
    super(data);
    this.at = this.at ?? new Date();
  }
}

@model()
export class TimestampModelWithId extends Model {
  @property({required: true})
  created: ModifyStamp;

  @property({required: true})
  updated: ModifyStamp;

  constructor(data?: Partial<TimestampModelWithId>) {
    super(data);
  }
}
