import {Model, model, property} from '@loopback/repository';
import {EnumStatus} from '../models';

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
