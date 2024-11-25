import {Model, model, property} from '@loopback/repository';
import {EnumStatus, EnumStatusValues, GeoPoint, Hotel} from '../models';

@model()
export class HotelFilter extends Model {
  @property({type: 'string', required: false})
  zone?: string;
  @property({type: 'string', required: false})
  name?: string;
  @property({type: 'string', required: false})
  status?: EnumStatus;

  constructor(data?: Partial<HotelFilter>) {
    super(data);
  }
}

export type HotelContact = Record<string, string>;
export type HotelMeta = Record<string, string | number>;

@model()
export class GeoPointDTO extends Model {
  @property({type: 'number', required: true})
  long: number;
  @property({type: 'number', required: true})
  lat: number;

  constructor(data?: Partial<GeoPoint>) {
    super(data);
  }

  static fromModel(data: GeoPoint): GeoPointDTO {
    return new GeoPointDTO({long: data.long, lat: data.lat});
  }
}

@model()
export class HotelDTO extends Model {
  @property({type: 'string', require: true})
  id?: string;
  @property({type: 'date', required: true})
  created_at: Date;
  @property({type: 'date', required: true})
  updated_at: Date;
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
  location?: GeoPointDTO;
  @property({type: 'string'})
  description?: string;
  @property({type: 'object', default: {}})
  meta?: HotelMeta;

  constructor(data?: Partial<HotelFilter>) {
    super(data);
  }

  static fromModel(data: Hotel): HotelDTO {
    return new HotelDTO({
      id: data.id?.toString(),
      created_at: data.created.at,
      updated_at: data.updated.at,
      name: data.name,
      contact: data.contact ?? {},
      status: data.status,
      zone: data.zone,
      location: data.location
        ? GeoPointDTO.fromModel(data.location)
        : undefined,
      description: data.description,
      meta: data.meta ?? {},
    });
  }
}
export type HotelsDTO = HotelDTO[];
