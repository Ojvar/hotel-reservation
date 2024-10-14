/* eslint-disable @typescript-eslint/naming-convention */
import {belongsTo, model} from '@loopback/repository';
import {ConditionsDTO} from '../dto';
import {ResolutionDTO} from '../dto/resolution.dto';
import {
  BuildingGroup as BaseBuildingGroup,
  Condition,
  EnumStatus,
  NullableString,
} from '../lib-models/src';
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

export interface BuldingGroupDetailsDTO {
  id: string;
  _id?: string;
  created: Date;
  updated: Date;
  status: EnumStatus;
  title: string;
  revision: number;
  conditions: ConditionsDTO;
  value?: string;
  parent_id: NullableString;
  resolution?: ResolutionDTO;
  children: BuldingGroupDetailsDTO[];
}
export type BuldingGroupDetailsListDTO = BuldingGroupDetailsDTO[];
export interface BuildingGroupTreeDTO {
  id: string;
  title: string;
  row_number: number;
  children: BuldingGroupDetailsDTO[];
}
export type BuildingGroupTreesDTO = BuildingGroupTreeDTO[];
