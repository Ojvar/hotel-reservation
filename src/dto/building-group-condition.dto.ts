import {AnyObject, Model, model, property} from '@loopback/repository';
import {Profile, Profiles} from '../models';

export enum EnumConditionMode {
  MODIFY_ENGINEERS = 0,
  CHECK_ENGINEERS = 1,
}

@model()
export class UserLicenseItem extends Model {
  @property({type: 'string', required: true})
  id: string;
  @property({type: 'string', required: true})
  level: string;
  @property({type: 'string', required: true})
  type: string;

  constructor(data?: Partial<UserLicenseItem>) {
    super(data);
  }
}

@model({settings: {strict: false}})
export class ConditionBlockProperty extends Model {
  [key: string | number | symbol]: unknown;

  @property({type: 'string', required: true})
  name: string;
  @property({type: 'string', required: true})
  title: string;
  @property({type: 'string', required: true})
  type: string;
  @property({type: 'string', required: true})
  value: string;
  @property({type: 'boolean', required: true})
  isMandatory: boolean;
  @property.array(Object, {required: true})
  options?: AnyObject[];

  constructor(data?: Partial<ConditionBlockProperty>) {
    super(data);
  }
}
export type ConditionBlockProperties = ConditionBlockProperty[];

@model({settings: {strict: false}})
export class ConditionBlock extends Model {
  [key: string | number | symbol]: unknown;

  @property({type: 'string', required: true})
  id: string;
  @property({type: 'string', required: true})
  title: string;
  @property({type: 'string', required: true})
  type: string;
  @property({type: 'string', required: false})
  parent: string | null;
  @property.array(ConditionBlockProperty, {required: true})
  propertise: ConditionBlockProperties;
  @property({type: 'string', required: true})
  children: ConditionBlocks;

  constructor(data?: Partial<ConditionBlock>) {
    super(data);
  }
}
export type ConditionBlocks = ConditionBlock[];

@model({settings: {strict: false}})
export class EngineerItemBlock extends ConditionBlock {
  [key: string | number | symbol]: unknown;

  constructor(data?: Partial<EngineerItemBlock>) {
    super(data);
  }
}

@model({settings: {strict: false}})
export class BlockCheckResult extends Model {
  [key: string | number | symbol]: unknown;

  @property({type: 'boolean', required: true})
  passed: boolean;
  @property.array(Profile, {required: true})
  selectedEngineers: Profiles;

  constructor(data?: Partial<BlockCheckResult>) {
    super(data);
  }
}
