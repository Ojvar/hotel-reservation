/* eslint-disable @typescript-eslint/naming-convention */
import {Entity, Model, model, property} from '@loopback/repository';
import {REMOVE_ID_SETTING} from './common';
import {EnumStatus, EnumStatusValues, ModifyStamp} from '../lib-models/src';

export enum EnumProjectLocationType {
  URBAN = 0,
  RURAL = 1,
}
export const EnumProjectLocationTypeValues = Object.values(
  EnumProjectLocationType,
);

@model({...REMOVE_ID_SETTING})
export class ProjectLocationPlate extends Model {
  @property({type: 'number', required: true})
  main: number;
  @property({type: 'number', required: true})
  sub: number;
  @property({type: 'number', required: true})
  sector: number;
  @property({type: 'number', required: true})
  part: number;

  constructor(data?: Partial<ProjectLocationPlate>) {
    super(data);
  }
}

@model({...REMOVE_ID_SETTING})
export class ProjectLocationAddress extends Model {
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
  plate: ProjectLocationPlate;

  @property({type: 'number', required: false})
  area?: number;
  @property({type: 'number', required: false})
  long?: number;
  @property({type: 'number', required: false})
  lat?: number;

  constructor(data?: Partial<ProjectLocationAddress>) {
    super(data);
  }
}

@model()
export class Project extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({required: true})
  created: ModifyStamp;
  @property({required: true})
  updated: ModifyStamp;
  @property({
    type: 'number',
    required: true,
    jsonSchema: {enum: EnumStatusValues},
  })
  status: EnumStatus;

  @property({required: true})
  address: ProjectLocationAddress;
  @property({required: true})
  plate: ProjectLocationPlate;

  constructor(data?: Partial<Project>) {
    super(data);
  }
}

export interface ProjectRelations {}
export type ProjectWithRelations = Project & ProjectRelations;
