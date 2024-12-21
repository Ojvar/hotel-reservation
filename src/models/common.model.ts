import {Model, model, property} from '@loopback/repository';

export enum EnumStatus {
  NO_DATA = 0,

  REGISTERED = 1,
  PENDING = 2,
  REJECTED = 3,
  ACCEPTED = 4,
  INQUIRY = 5,
  ACTIVE = 6,
  DEACTIVE = 7,

  CONFIRMED = 20,
  PAIED = 21,
  CLOSED = 22,

  EXPIRED = 31,
  SUSPENDED = 32,
  BLOCKED = 33,
}

export const EnumStatusValues = Object.values(EnumStatus);

export const REMOVE_ID = {IdInjection: false};
export const REMOVE_ID_SETTING = {settings: {...REMOVE_ID}};
export const MONGODB_STR_TYPE = {mongodb: {dataType: 'string'}};
export const MONGODB_OBJ_ID = {mongodb: {dataType: 'ObjectId'}};
export const MONGODB_ID = {
  mongodb: {dataType: 'ObjectId', fieldName: '_id'},
};

@model({...REMOVE_ID_SETTING})
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

@model({...REMOVE_ID_SETTING})
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

@model({...REMOVE_ID_SETTING})
export class TimestampModelWithId extends Model {
  @property({required: true})
  created: ModifyStamp;

  @property({required: true})
  updated: ModifyStamp;

  constructor(data?: Partial<TimestampModelWithId>) {
    super(data);
  }
}
