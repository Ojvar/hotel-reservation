/* eslint-disable @typescript-eslint/naming-convention */
import {AnyObject, Model, model, property} from '@loopback/repository';
import {
  BuildingGroupCondition,
  BuildingGroupWithRelations,
  Condition,
  CONDITION_OPERATORS,
  EnumProgressStatus,
  EnumStatus,
  EnumStatusValues,
  Resolution,
} from '../models';
import {ResolutionDTO} from './resolution.dto';

@model({settings: {IdInjection: false}})
export class ConditionDTO extends Model {
  @property({type: 'number', required: true})
  row_number: number;
  @property({type: 'string', required: true})
  key: string;
  @property({type: 'string', required: true})
  min: string | number;
  @property({type: 'string', required: false})
  max?: string | number;
  @property({type: 'string', required: true})
  operator: CONDITION_OPERATORS;

  constructor(data?: Partial<ConditionDTO>) {
    super(data);
  }

  static fromModel(data: Condition): ConditionDTO {
    return new ConditionDTO({
      row_number: data.row_number,
      key: data.key,
      min: data.min,
      max: data.max,
      operator: data.operator,
    });
  }
}
export type ConditionsDTO = ConditionDTO[];

@model()
export class BuildingGroupDTO extends Model {
  @property({type: 'string', id: true, generated: true})
  id?: string;
  @property({type: 'date', required: true})
  created: Date;
  @property({type: 'date', required: true})
  updated: Date;
  @property({
    type: 'number',
    required: true,
    jsonSchema: {enum: EnumStatusValues},
  })
  status: EnumStatus;
  @property({type: 'string', required: true})
  title: string;
  @property({type: 'number', required: true})
  revision: number;
  @property.array(ConditionDTO, {required: false})
  conditions?: ConditionsDTO;
  @property({type: 'string', required: false})
  value?: string;
  @property({
    type: 'string',
    required: false,
    jsonSchema: {nullable: true},
  })
  parent_id: string | null;
  @property({type: 'string', required: false})
  resolution_id?: string;
  @property({required: false})
  buildingGroupCondition?: BuildingGroupCondition;

  constructor(data?: Partial<BuildingGroupDTO>) {
    super(data);
  }

  static fromModel(data: BuildingGroupWithRelations): BuildingGroupDTO {
    return new BuildingGroupDTO({
      id: data.id,
      created: data.created.at,
      updated: data.updated.at,
      status: data.status,
      title: data.title,
      revision: data.revision,
      conditions: data.conditions?.map(ConditionDTO.fromModel),
      resolution_id: data.resolution_id,
      buildingGroupCondition: data.buildingGroupCondition
        ? new BuildingGroupCondition(data.buildingGroupCondition)
        : undefined,
    });
  }
}

@model()
export class BuildingGroupDetailsDTO extends Model {
  _id?: string;

  @property({type: 'string'})
  id: string;
  @property({type: 'date'})
  created_at: Date;
  @property({type: 'date'})
  updated_at: Date;
  @property({type: 'number'})
  status: EnumProgressStatus;
  @property({type: 'string'})
  title: string;
  @property({type: 'number'})
  revision: number;

  @property.array(ConditionDTO, {})
  conditions: ConditionsDTO;

  @property({type: 'string'})
  value?: string;
  @property({type: 'string'})
  parent_id?: string;

  @property({})
  resolution?: ResolutionDTO;

  @property.array(BuildingGroupDetailsDTO, {})
  children?: BuildingGroupDetailsDTO[];

  constructor(data?: Partial<BuildingGroupDetailsDTO>) {
    super(data);
  }

  static fromModel(data: AnyObject): BuildingGroupDetailsDTO {
    return new BuildingGroupDetailsDTO({
      id: data.id ?? data._id,
      created_at: data.created.at,
      updated_at: data.updated.at,
      status: data.status,
      title: data.title,
      revision: data.revision,
      value: data.value,
      parent_id: data.parent_id,

      children: data.children?.map(BuildingGroupDetailsDTO.fromModel),
      conditions: data.conditions?.map(ConditionDTO.fromModel),
      resolution: data.resolution
        ? ResolutionDTO.fromModel(new Resolution(data.resolution))
        : undefined,
    });
  }
}

export type BuldingGroupDetailsListDTO = BuildingGroupDetailsDTO[];
export interface BuildingGroupTreeDTO {
  id: string;
  title: string;
  row_number: number;
  children: BuildingGroupDetailsDTO[];
}
export type BuildingGroupTreesDTO = BuildingGroupTreeDTO[];
