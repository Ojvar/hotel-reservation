import { model } from '@loopback/repository';
import { BuildingGroup as BaseBuildingGroup } from '../lib-models/src';

@model({
  name: 'building_groups',
  settings: {
    indexes: [{ keys: { parent_id: 1 }, options: { name: 'parent_id_index' } }],
  },
})
export class BuildingGroup extends BaseBuildingGroup {
  constructor(data?: Partial<BuildingGroup>) {
    super(data);
  }
}

export interface BuildingGroupRelations { }
export type BuildingGroupWithRelations = BuildingGroup & BuildingGroupRelations;
