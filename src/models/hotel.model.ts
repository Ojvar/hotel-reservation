import {Entity, Model, model, property} from '@loopback/repository';
import {EnumStatus, EnumStatusValues, ModifyStamp} from './common.model';

export type HotelContact = Record<string, string>;
export type HotelMeta = Record<string, string | number>;

@model()
export class GeoPoint extends Model {
  @property({type: 'number', required: true})
  long: number;
  @property({type: 'number', required: true})
  lat: number;

  constructor(data?: Partial<GeoPoint>) {
    super(data);
  }
}

@model()
export class Hotel extends Entity {
  @property({type: 'string', id: true, generated: true})
  id?: string;
  @property({required: true})
  created: ModifyStamp;
  @property({required: true})
  updated: ModifyStamp;
  @property({type: 'string', required: true})
  name: string;
  @property({type: 'object', itemType: 'string', default: {}})
  contact?: HotelContact;
  @property({
    type: 'number',
    required: true,
    jsonSchema: {enum: EnumStatusValues},
  })
  status: EnumStatus;
  @property({type: 'string', required: true})
  zone: string;
  @property({required: false})
  location?: GeoPoint;
  @property({type: 'string'})
  description?: string;
  @property({type: 'object', default: {}})
  meta?: HotelMeta;

  constructor(data?: Partial<Hotel>) {
    super(data);
  }
}

export interface HotelRelations {}
export type HotelWithRelations = Hotel & HotelRelations;
