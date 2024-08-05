/* eslint-disable @typescript-eslint/naming-convention */
import {Model, model, property} from '@loopback/repository';
import {BuildingProjectStaffItemDTO} from './project-management.dto';

@model()
export class RmqStaffAcceptDTO extends Model {
  @property({type: 'string'})
  project_id: string;
  @property({})
  staff: BuildingProjectStaffItemDTO;

  constructor(data?: Partial<RmqStaffAcceptDTO>) {
    super(data);
  }
}
