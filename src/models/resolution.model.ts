import {model} from '@loopback/repository';
import {Resolution as BaseResolution} from '../lib-models/src';

export {ResolutionItems} from '../lib-models/src';

@model({
  name: 'resolutions',
  settings: {
    indexes: [
      {
        keys: {title: 1},
        options: {unique: true, name: 'title_index'},
      },
    ],
  },
})
export class Resolution extends BaseResolution {
  constructor(data?: Partial<Resolution>) {
    super(data);
  }
}

export interface ResolutionRelations {}
export type ResolutionWithRelations = Resolution & ResolutionRelations;
