/* eslint-disable @typescript-eslint/naming-convention */
import {Model, model, property} from '@loopback/repository';
import {BuildingProject} from '../models';

@model()
export class BuildingProjectRegistrationCodeDTO extends Model {
  @property({type: 'string'})
  tracking_code: string;

  constructor(data?: Partial<BuildingProjectRegistrationCodeDTO>) {
    super(data);
  }
}

@model()
export class BuildingProjectDTO extends Model {
  id: string;
  created_at: Date;
  updated_at: Date;
  [key: string]: unknown;

  constructor(data?: Partial<BuildingProjectDTO>) {
    super(data);
  }

  static fromModel(data: BuildingProject): BuildingProjectDTO {
    return new BuildingProjectDTO({...data});
  }
}
