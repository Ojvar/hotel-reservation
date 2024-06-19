/* eslint-disable @typescript-eslint/naming-convention */
import {Model, model, property} from '@loopback/repository';

@model()
export class ProjectRegistrationCodeDTO extends Model {
  @property({type: 'string'})
  tracking_code: string;

  constructor(data?: Partial<ProjectRegistrationCodeDTO>) {
    super(data);
  }
}

@model()
export class NewProjectDTO extends Model {
  constructor(data?: Partial<NewProjectDTO>) {
    super(data);
  }
}
