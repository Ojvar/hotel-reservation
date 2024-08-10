import { model } from '@loopback/repository';
import { BuildingGroupCondition as BaseBuildingGroupCondition } from '../lib-models/src';

// TODO: THIS MODEL SHOULD BE CHANGED
@model({
  name: 'building_group_conditions',
  settings: {
    //    indexes: [{keys: {parent_id: 1}, options: {name: 'parent_id_index'}}],
  },
})
export class BuildingGroupCondition extends BaseBuildingGroupCondition {
  constructor(data?: Partial<BuildingGroupCondition>) {
    super(data);
  }
}

export interface BuildingGroupConditionRelations { }
export type BuildingGroupConditionWithRelations = BuildingGroupCondition &
  BuildingGroupConditionRelations;
