/* eslint-disable @typescript-eslint/naming-convention */
import {Entity, model, property, belongsTo} from '@loopback/repository';
import {EnumStatus, EnumStatusValues, ModifyStamp} from './common.model';
import {Hotel} from './hotel.model';
import {Discount} from './discount.model';

@model({
  name: 'reservations',
  settings: {indexes: [{key: 'user_id', options: {unique: true}}]},
})
export class Reservation extends Entity {
  @property({type: 'string', id: true, generated: true})
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
  @property({type: 'string', required: true})
  user_id: string;
  @property.array(Date, {required: true})
  days: Date[];
  @property({type: 'number', required: true})
  total: number;
  @property({type: 'number'})
  paied?: number;
  @property({type: 'string', required: false})
  transaction_id?: string;
  @property({type: 'number', required: true})
  passengers_count: number;

  @belongsTo(() => Hotel, {name: 'hotel'}, {required: true})
  hotel_id: string;
  @belongsTo(() => Discount, {name: 'discount'}, {required: false})
  discount_id?: string;

  @property({required: false})
  confirmed?: ModifyStamp;

  constructor(data?: Partial<Reservation>) {
    super(data);
  }

  markAsRemoved(operatorId: string): void {
    this.status = EnumStatus.DEACTIVE;
    this.updated = new ModifyStamp({by: operatorId});
  }
}

export interface ReservationRelations {
  hotel?: Hotel;
  discount?: Discount;
}
export type ReservationWithRelations = Reservation & ReservationRelations;
