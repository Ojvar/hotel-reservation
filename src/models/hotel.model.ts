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

  update(operatorId: string, newData: Hotel): void {
    const now = new ModifyStamp({by: operatorId});
    this.updated = now;

    this.name = newData.name;
    this.zone = newData.zone;
    this.meta = newData.meta;
    this.contact = newData.contact;
    this.location = newData.location;
    this.description = newData.description;
  }

  markAsRemoved(operatorId: string): void {
    const now = new ModifyStamp({by: operatorId});
    this.updated = now;
    this.status = EnumStatus.DEACTIVE;
  }
}

export interface HotelRelations {}
export type HotelWithRelations = Hotel & HotelRelations;
