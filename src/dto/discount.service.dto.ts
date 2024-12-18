/* eslint-disable @typescript-eslint/naming-convention */
import {Model, model, property} from '@loopback/repository';
import {Discount, EnumStatus, EnumStatusValues, ModifyStamp} from '../models';

@model()
export class DiscountFilter extends Model {
  @property({type: 'string'})
  id?: string;
  @property({type: 'string'})
  title?: string;
  @property({type: 'string'})
  code?: string;
  @property({type: 'string'})
  status?: EnumStatus;

  constructor(data?: Partial<DiscountFilter>) {
    super(data);
  }
}

@model()
export class NewDiscountDTO extends Model {
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

  constructor(data?: Partial<NewDiscountDTO>) {
    super(data);
  }

  toModel(operatorId: string): Discount {
    const now = new ModifyStamp({by: operatorId});
    return new Discount({
      created: now,
      updated: now,
      status: EnumStatus.ACTIVE,
      title: this.title,
      code: this.code,
      expire_date: new Date(this.expire_date),
      value: +this.value,
      meta: this.meta ?? {},
    });
  }
}

@model()
export class DiscountDTO extends Model {
  @property({type: 'string'})
  id?: string;
  @property({type: 'date', required: true})
  created_at: Date;
  @property({type: 'date', required: true})
  updated_at: Date;
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

  constructor(data?: Partial<DiscountDTO>) {
    super(data);
  }

  static fromModel(data: Discount): DiscountDTO {
    return new DiscountDTO({
      id: data.id?.toString(),
      created_at: data.created.at,
      updated_at: data.updated.at,
      status: data.status,
      title: data.title,
      code: data.code,
      expire_date: new Date(data.expire_date),
      value: +data.value,
      meta: data.meta ?? {},
    });
  }
}
export type DiscountsDTO = DiscountDTO[];
