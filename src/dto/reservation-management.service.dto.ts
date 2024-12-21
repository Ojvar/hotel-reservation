import {Model, model, property} from '@loopback/repository';

@model()
export class RejectReservationRequestDTO extends Model {
  @property({type: 'string', required: true})
  description: string;

  constructor(data?: Partial<RejectReservationRequestDTO>) {
    super(data);
  }
}
