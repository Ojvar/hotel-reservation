/* eslint-disable @typescript-eslint/naming-convention */
import {Model, model, property} from '@loopback/repository';
import {
  EnumProjectLocationType,
  EnumProjectLocationTypeValues,
  ProjectLocationAddress,
  ProjectLocationPlate,
} from '../models';

@model({})
export class NewProjectLocationPlateDTO extends Model {
  @property({type: 'number', required: true})
  main: number;
  @property({type: 'number', required: true})
  sub: number;
  @property({type: 'number', required: true})
  sector: number;
  @property({type: 'number', required: true})
  part: number;

  constructor(data?: Partial<NewProjectLocationPlateDTO>) {
    super(data);
  }

  toModel(): ProjectLocationPlate {
    return new ProjectLocationPlate({
      main: this.main,
      sub: this.sub,
      sector: this.sector,
      part: this.part,
    });
  }
}

@model({})
export class NewProjectLocationAddressDTO extends Model {
  @property({type: 'string', required: true})
  city_id: string;
  @property({type: 'string', required: true})
  municipality_district_id: string;
  @property({type: 'string', required: true})
  street: string;
  @property({type: 'string', required: true})
  alley: string;
  @property({type: 'string', required: true})
  plaque: string;
  @property({type: 'number', required: true})
  zip_code: number;
  @property({
    type: 'number',
    required: true,
    jsonSchema: {enum: EnumProjectLocationTypeValues},
  })
  type: EnumProjectLocationType;

  @property({required: true})
  plate: NewProjectLocationPlateDTO;

  @property({type: 'number', required: false})
  area?: number;
  @property({type: 'number', required: false})
  long?: number;
  @property({type: 'number', required: false})
  lat?: number;

  constructor(data?: Partial<NewProjectLocationAddressDTO>) {
    super(data);
    this.plate = new NewProjectLocationPlateDTO(this.plate);
  }

  toModel(): ProjectLocationAddress {
    return new ProjectLocationAddress({
      city_id: this.city_id,
      municipality_district_id: this.municipality_district_id,
      street: this.street,
      alley: this.alley,
      plaque: this.plaque,
      zip_code: this.zip_code,
      type: this.type,
      plate: this.plate.toModel(),
      area: this.area,
      long: this.long,
      lat: this.lat,
    });
  }
}
