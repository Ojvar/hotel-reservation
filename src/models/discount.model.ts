/* eslint-disable @typescript-eslint/naming-convention */
import {Entity, model, property} from '@loopback/repository';
import {EnumStatus, EnumStatusValues, ModifyStamp} from './common.model';

@model({
  name: 'discounts',
  settings: {indexes: [{key: 'code', options: {unique: true}}]},
})
export class Discount extends Entity {
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

  @property({type: 'string', required: true})
  title: string;
  @property({type: 'string', required: true})
  code: string;
  @property({type: 'date', required: true})
  expire_date: Date;
  @property({type: 'number', required: true})
  value: number;
  @property({type: 'object', default: {}})
  meta?: object;

  constructor(data?: Partial<Discount>) {
    super(data);
  }

  markAsRemoved(operatorId: string): void {
    this.status = EnumStatus.DEACTIVE;
    this.updated = new ModifyStamp({by: operatorId});
  }

  update(operatorId: string, data: Discount): void {
    this.title = data.title;
    this.code = data.code;
    this.expire_date = new Date(data.expire_date);
    this.meta = data.meta ?? {};
    this.value = +data.value;
    this.updated = new ModifyStamp({by: operatorId});
  }
}

export interface DiscountRelations {}
export type DiscountWithRelations = Discount & DiscountRelations;
