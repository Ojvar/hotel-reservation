import {Entity, Model, model, property} from '@loopback/repository';
import {EnumStatus, EnumStatusValues} from './common.model';

export type HotelContact = Record<string, string>;

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
  meta?: Record<string, string | number>;

  constructor(data?: Partial<Hotel>) {
    super(data);
  }
}

export interface HotelRelations {}
export type HotelWithRelations = Hotel & HotelRelations;
