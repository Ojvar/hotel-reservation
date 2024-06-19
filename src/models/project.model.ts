/* eslint-disable @typescript-eslint/naming-convention */
import {Entity, Model, model, property} from '@loopback/repository';
import {
  EnumStatus,
  EnumStatusValues,
  ModifyStamp,
  REMOVE_ID_SETTING,
  TimestampModelWithId,
} from './common';
import {Attachment} from '../lib-models/src';

@model({})
export class ProjectLawyer extends TimestampModelWithId {
  @property({type: 'string', required: true})
  user_id: string;
  @property({type: 'string', required: true})
  power_of_attorney_number: string;
  @property({type: 'date', required: true})
  power_of_attorney_date: Date;
  @property({type: 'string', required: false})
  description?: string;
  @property({
    type: 'number',
    required: true,
    jsonSchema: {enum: EnumStatusValues},
  })
  status: EnumStatus;
  @property({required: false})
  attachments?: Attachment;

  constructor(data?: Partial<ProjectLawyer>) {
    super(data);
    this.status = this.status ?? EnumStatus.ACTIVE;
  }
}
export type ProjectLawyers = ProjectLawyer[];

@model({})
export class ProjectOwner extends TimestampModelWithId {
  @property({type: 'string', required: true})
  user_id: string;
  @property({type: 'string', required: true})
  address: string;
  @property({type: 'boolean', required: true})
  is_delegate: boolean;
  @property({
    type: 'number',
    required: true,
    jsonSchema: {enum: EnumStatusValues},
  })
  status: EnumStatus;

  constructor(data?: Partial<ProjectOwner>) {
    super(data);
    this.is_delegate = this.is_delegate ?? false;
    this.status = this.status ?? EnumStatus.ACTIVE;
  }
}
export type ProjectOwners = ProjectOwner[];

@model({...REMOVE_ID_SETTING})
export class ProjectOwnership extends Model {
  @property.array(ProjectOwner, {required: true})
  owners: ProjectOwners;
  @property({type: 'boolean', required: true})
  has_partners: boolean;
  @property({required: false})
  attachments: Attachment;

  constructor(data?: Partial<ProjectOwnership>) {
    super(data);
  }
}

@model({...REMOVE_ID_SETTING})
export class ProjectBuildingSiteLocation extends Model {
  @property({type: 'string', required: true})
  location: string;
  @property({type: 'number', required: true})
  land_occupancy: number;

  constructor(data?: Partial<ProjectBuildingSiteLocation>) {
    super(data);
  }
}

@model({...REMOVE_ID_SETTING})
export class ProjectOwnershipType extends Model {
  @property({type: 'string', required: true})
  ownership_type_id: string;
  @property({type: 'string', required: false})
  description?: string;
  @property({type: 'string', required: true})
  form_number: string;
  @property({type: 'string', required: true})
  issue_date: string;
  @property({type: 'string', required: true})
  renewal_code: string;
  @property({type: 'number', required: true})
  building_density: number;

  constructor(data?: Partial<ProjectOwnershipType>) {
    super(data);
  }
}

@model({...REMOVE_ID_SETTING})
export class ProjectPropertyRegistrationDetails extends Model {
  @property({type: 'number', required: true})
  main: number;
  @property({type: 'number', required: true})
  sub: number;
  @property({type: 'number', required: true})
  sector: number;
  @property({type: 'number', required: true})
  part: number;

  constructor(data?: Partial<ProjectPropertyRegistrationDetails>) {
    super(data);
  }
}

@model({...REMOVE_ID_SETTING})
export class ProjectLocationAddress extends Model {
  //  Property Registation details
  @property({required: true})
  property_registration_details: ProjectPropertyRegistrationDetails;

  // Map geo data
  @property({type: 'number', required: false})
  long?: number;
  @property({type: 'number', required: false})
  lat?: number;
  @property({type: 'object', required: false})
  geo_info?: object;

  // Location
  @property({type: 'string', required: true})
  city_id: string;
  @property({type: 'string', required: true})
  municipality_district_id: string;
  @property({type: 'number', required: false})
  area?: number;

  @property({type: 'string', required: true})
  street: string;
  @property({type: 'string', required: true})
  alley: string;
  @property({type: 'string', required: true})
  plaque: string;
  @property({type: 'number', required: true})
  zip_code: number;

  // // Additional data
  // @property({ type: 'string', required: true })
  // type: string;

  constructor(data?: Partial<ProjectLocationAddress>) {
    super(data);
  }
}

@model({...REMOVE_ID_SETTING})
export class ProjectSpecification extends Model {
  // Keep all descriptions for all fields
  @property({type: 'object', items: 'string', required: true})
  descriptions: Record<string, string>;

  // Meta data
  @property({type: 'object'})
  meta?: Record<string, string | number>;

  // Project data
  @property({type: 'number', required: true})
  ground_area_before: number;
  @property({type: 'number', required: true})
  ground_area_after: number;
  @property({type: 'number', required: true})
  total_area: number;
  @property({type: 'number', required: true})
  elevator_stops: number;
  @property({type: 'number', required: true})
  total_floors: number;
  @property({type: 'number', required: true})
  commercial_units: number;
  @property({type: 'number', required: true})
  residental_units: number;
  @property({type: 'number', required: true})
  total_units: number;
  @property({type: 'number', required: true})
  parking_count: number;
  @property({type: 'number', required: true})
  house_storage_count: number;

  // Districts data
  @property({type: 'number', required: true})
  distict_north: number;
  @property({type: 'number', required: true})
  distict_south: number;
  @property({type: 'number', required: true})
  distict_east: number;
  @property({type: 'number', required: true})
  distict_west: number;

  // Building data
  @property({type: 'string', required: true})
  building_priority: string;
  @property({type: 'string', required: true})
  building_type_id: string;
  @property.array(String, {required: true})
  foundation_types: string[];
  @property.array(String, {required: true})
  root_types: string[];
  @property.array(String, {required: true})
  floor_access_systems: string[];
  @property.array(String, {required: true})
  building_frontages: string[];
  @property.array(String, {required: true})
  roof_cover_types: string[];
  @property.array(String, {required: true})
  window_types: string[];
  @property.array(String, {required: true})
  cooling_system_types: string[];
  @property.array(String, {required: true})
  heating_system_types: string[];
  @property.array(String, {required: true})
  sewage_disposals: string[];
  @property.array(String, {required: true})
  earth_connection_types: string[];

  // Optional data
  @property({type: 'boolean', required: true})
  polystyrene: boolean;
  @property({type: 'boolean', required: true})
  underground: boolean;
  @property({type: 'boolean', required: true})
  dilapidated: boolean;
  @property({type: 'string', required: true})
  incremental_project: boolean;

  /// TODO: SHOULD OPTIMIZE
  @property({type: 'string', required: true})
  two_supervisors: boolean;

  // Quota
  @property({type: 'string', required: false})
  quota_type_id: string;
  @property({type: 'number', required: false})
  quota_value: number;

  constructor(data?: Partial<ProjectSpecification>) {
    super(data);
  }
}

@model()
export class Project extends Entity {
  @property({type: 'string', id: true, generated: true})
  id?: string;
  @property({required: true})
  created: ModifyStamp;
  @property({required: true})
  updated: ModifyStamp;
  @property({
    type: 'number',
    required: true,
    jsonSchema: {enum: EnumStatusValues},
  })
  status: EnumStatus;

  @property({required: true})
  address: ProjectLocationAddress;
  @property({required: true})
  ownership_type: ProjectOwnershipType;
  @property.array(String, {required: true})
  project_usage_types: string[];
  @property({type: 'string', required: false})
  project_usage_description?: string;
  @property({required: true})
  building_site_lcoation: ProjectBuildingSiteLocation;
  @property({required: true})
  ownership: ProjectOwnership;
  @property.array(ProjectLawyer, {required: false, default: []})
  lawyers?: ProjectLawyers;
  @property({required: true})
  specification: ProjectSpecification;

  constructor(data?: Partial<Project>) {
    super(data);
    this.status = this.status ?? EnumStatus.ACTIVE;
    this.lawyers = this.lawyers ?? [];
  }
}

export interface ProjectRelations {}
export type ProjectWithRelations = Project & ProjectRelations;
