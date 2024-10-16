/* eslint-disable @typescript-eslint/naming-convention */
import {belongsTo, model} from '@loopback/repository';
import {BuildingGroup as BaseBuildingGroup, Condition} from '../lib-models/src';
import {BuildingGroupCondition} from './building-group-condition.model';

export {Condition, Conditions} from '../lib-models/src';

@model({
  name: 'building_groups',
  settings: {
    indexes: [{keys: {parent_id: 1}, options: {name: 'parent_id_index'}}],
  },
})
export class BuildingGroup extends BaseBuildingGroup {
  @belongsTo(() => BuildingGroupCondition, {name: 'buildingGroupCondition'})
  value: string;

  constructor(data?: Partial<BuildingGroup>) {
    super(data);
    this.conditions = this.conditions?.map(c => new Condition(c));
  }
}

export interface BuildingGroupRelations {
  buildingGroupCondition?: BuildingGroupCondition;
}
export type BuildingGroupWithRelations = BuildingGroup & BuildingGroupRelations;
