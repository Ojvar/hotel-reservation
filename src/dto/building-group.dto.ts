/* eslint-disable @typescript-eslint/naming-convention */
import {Model, model, property} from '@loopback/repository';
import {
  BuildingGroupCondition,
  BuildingGroupWithRelations,
  Condition,
  CONDITION_OPERATORS,
  EnumStatus,
  EnumStatusValues,
} from '../models';

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
  @property({})
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
