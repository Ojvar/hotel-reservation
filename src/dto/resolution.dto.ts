/* eslint-disable @typescript-eslint/naming-convention */
import {Model, model, property} from '@loopback/repository';
import {
  EnumStatus,
  EnumStatusValues,
  Resolution,
  ResolutionItems,
} from '../models';

@model()
export class ResolutionDTO extends Model {
  @property({type: 'string'})
  id?: string;
  @property({type: 'string'})
  title: string;
  @property({type: 'date'})
  created_at: Date;
  @property({type: 'date'})
  updated_at: Date;
  // @property({})
  // attachments: Attachments;
  @property({type: 'object', itemType: 'string', required: true})
  items: ResolutionItems;
  @property({
    type: 'number',
    jsonSchema: {enum: EnumStatusValues},
  })
  status: EnumStatus;

  constructor(data?: Partial<ResolutionDTO>) {
    super(data);
  }

  static fromModel(data: Resolution): ResolutionDTO {
    return new ResolutionDTO({
      id: data.id,
      title: data.title,
      created_at: data.created.at,
      updated_at: data.updated.at,
      items: data.items,
      status: data.status,
    });
  }
}
