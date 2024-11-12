/* eslint-disable @typescript-eslint/naming-convention */
import {
  AnyObject,
  belongsTo,
  Entity,
  Model,
  model,
  property,
} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {EnumConditionMode} from '../dto';
import {BlockCheckerService} from '../services';
import {
  EnumProgressStatus,
  EnumProgressStatusValues,
  EnumStatus,
  EnumStatusValues,
  ModifyStamp,
  ModifyStampWithDescription,
  REMOVE_ID_SETTING,
  TimestampModelWithId,
} from './common';
import {Office} from './office.model';

export enum EnumBuildingProjectTechSpecItems {
  UNIT_INFO = 'UNIT_INFO',
  LABORATORY_CONCRETE = 'LABORATORY_CONCRETE',
  LABORATORY_WELDING = 'LABORATORY_WELDING',
  LABORATORY_TENSILE = 'LABORATORY_TENSILE',
  LABORATORY_POLYSTYRENE = 'LABORATORY_POLYSTYRENE',
  LABORATORY_ELECTRICITY = 'LABORATORY_ELECTRICITY',
}

export enum EnumBuildingUnitDirection {
  NORTH = 0,
  SOUTH = 1,
  EAST = 2,
  WEST = 3,
}
export const EnumBuildingUnitDirectionValues = Object.values(
  EnumBuildingUnitDirection,
);

@model()
export class BuildingProjectAttachmentSing extends TimestampModelWithId {
  @property({type: 'string', required: true})
  user_id: string;
  @property({
    type: 'number',
    required: true,
    jsonSchema: {enum: EnumStatusValues},
  })
  status: EnumStatus;
  @property({type: 'string', required: false})
  description?: string;

  constructor(data?: Partial<BuildingProjectAttachmentSing>) {
    super(data);
    this.status = this.status ?? EnumStatus.ACTIVE;
  }
}
export type BuildingProjectAttachmentSings = BuildingProjectAttachmentSing[];

@model()
export class BuildingProjectStaffResponse extends Model {
  @property({
    type: 'number',
    required: true,
    jsonSchema: {enum: EnumStatusValues},
  })
  status: EnumStatus;
  @property({required: true})
  responsed: ModifyStamp;
  @property({type: 'string', required: false})
  description: string;

  constructor(data?: Partial<BuildingProjectStaffResponse>) {
    super(data);
    this.status = this.status ?? EnumStatus.ACTIVE;
  }
}

@model()
export class BuildingProjectStaffItem extends TimestampModelWithId {
  @property({type: 'object', required: false})
  meta?: Record<string, number | string>;
  @property({type: 'string', required: true})
  user_id: string;
  @property({type: 'string', required: true})
  field_id: string;
  @property({type: 'number', required: true})
  status: EnumStatus;
  @property({required: false})
  response?: BuildingProjectStaffResponse;

  constructor(data?: Partial<BuildingProjectStaffItem>) {
    super(data);
    this.status = this.status ?? EnumStatus.ACTIVE;
    this.response = this.response
      ? new BuildingProjectStaffResponse(this.response)
      : undefined;
  }

  markAsRemoved(userId: string) {
    this.updated = new ModifyStamp({by: userId});
    this.status = EnumStatus.DEACTIVE;
  }

  setResponse(userId: string, status: EnumStatus, description?: string) {
    if (this.response?.status) {
      throw new HttpErrors.UnprocessableEntity('Response already registered');
    }
    const now = new ModifyStamp({by: userId});
    this.status = status;
    this.response = new BuildingProjectStaffResponse({
      responsed: now,
      description,
      status,
    });
    this.updated = now;
  }
}
export type BuildingProjectStaffItems = BuildingProjectStaffItem[];

@model({...REMOVE_ID_SETTING})
export class BuildingProjectAttachmentItem extends TimestampModelWithId {
  @property({type: 'string', required: true})
  field: string;
  @property({type: 'string', required: true})
  file_id: string;
  @property({
    type: 'number',
    required: true,
    jsonSchema: {enum: EnumStatusValues},
  })
  status: EnumStatus;
  @property.array(BuildingProjectAttachmentSing, {requird: false})
  signes: BuildingProjectAttachmentSings;
  @property({type: 'string', required: false})
  comment?: string;
  @property({required: false})
  response?: ModifyStampWithDescription;

  constructor(data?: Partial<BuildingProjectAttachmentItem>) {
    super(data);
    this.status = this.status ?? EnumStatus.ACTIVE;
    this.signes = this.signes?.map(x => new BuildingProjectAttachmentSing(x));
  }

  get isLocked(): boolean {
    return this.signes?.some(s => s.status === EnumStatus.ACTIVE);
  }

  signByUserByResponse(
    operatorId: string,
    userId: string,
    status: EnumStatus.ACCEPTED | EnumStatus.REJECTED,
    description?: string,
  ): void {
    const signs = this.signes ?? [];
    const oldSign = signs.find(
      s => s.user_id === userId && s.status === EnumStatus.ACCEPTED,
    );
    // Already signed
    if (oldSign?.status === status) {
      return;
    }
    if (oldSign) {
      throw new HttpErrors.UnprocessableEntity(
        `User already signed the attachment, id: ${this.id}, userId: ${userId}`,
      );
    }
    const now = new ModifyStamp({by: operatorId});
    this.signes = [
      ...signs,
      new BuildingProjectAttachmentSing({
        user_id: userId,
        created: now,
        updated: now,
        status,
        description,
      }),
    ];
    this.updated = now;
  }

  removeUserSign(userId: string, signId: string): void {
    const signs = this.signes ?? [];
    const oldSign = signs.find(
      s => s.id?.toString() === signId && s.status !== EnumStatus.DEACTIVE,
    );
    if (!oldSign) {
      throw new HttpErrors.UnprocessableEntity(
        `Invalid sign record, ${signId}`,
      );
    }

    const now = new ModifyStamp({by: userId});

    // Update signs data
    oldSign.updated = now;
    oldSign.status = EnumStatus.DEACTIVE;

    // Update attachments
    this.signes = signs;
    this.updated = now;
  }

  markAsRemoved(userId: string) {
    this.status = EnumStatus.DEACTIVE;
    this.updated = new ModifyStamp({by: userId});
  }

  setResponse(
    userId: string,
    status: EnumStatus.ACCEPTED | EnumStatus.REJECTED,
    comment?: string,
  ): void {
    this.response = new ModifyStampWithDescription({
      by: userId,
      description: comment,
    });
    this.updated = new ModifyStamp({by: userId});
    this.status = status;
  }
}
export type BuildingProjectAttachmentItems = BuildingProjectAttachmentItem[];

@model({})
export class BuildingProjectLawyer extends TimestampModelWithId {
  @property({type: 'string', required: true})
  user_id: string;
  @property({type: 'string', required: true})
  power_of_attorney_number: string;
  @property({type: 'date'})
  power_of_attorney_date?: Date;
  @property({type: 'string'})
  description?: string;
  @property({
    type: 'number',
    required: true,
    jsonSchema: {enum: EnumStatusValues},
  })
  status: EnumStatus;
  @property({type: 'string', required: true})
  auth_pwd: string;
  @property({type: 'date', required: false})
  expire_date?: Date;
  @property({type: 'string', required: true})
  document_no: string;

  constructor(data?: Partial<BuildingProjectLawyer>) {
    super(data);
    this.status = this.status ?? EnumStatus.ACTIVE;
  }

  markAsDeactive(userId: string): void {
    this.status = EnumStatus.DEACTIVE;
    this.updated = new ModifyStamp({by: userId});
  }
}
export type BuildingProjectLawyers = BuildingProjectLawyer[];

@model({})
export class BuildingProjectOwner extends TimestampModelWithId {
  @property({type: 'string', required: true})
  user_id: string;
  @property({tyep: 'string', required: true})
  address: string;
  @property({type: 'boolean', required: true})
  is_delegate: boolean;
  @property({
    type: 'number',
    required: true,
    jsonSchema: {enum: EnumStatusValues},
  })
  status: EnumStatus;

  constructor(data?: Partial<BuildingProjectOwner>) {
    super(data);
    this.is_delegate = this.is_delegate ?? false;
    this.status = this.status ?? EnumStatus.ACTIVE;
  }
}
export type BuildingProjectOwners = BuildingProjectOwner[];

@model({...REMOVE_ID_SETTING})
export class BuildingProjectOwnership extends Model {
  @property.array(BuildingProjectOwner, {required: true})
  owners: BuildingProjectOwners;
  @property({type: 'boolean', required: true})
  has_partners: boolean;

  constructor(data?: Partial<BuildingProjectOwnership>) {
    super(data);
  }
}

@model({...REMOVE_ID_SETTING})
export class BuildingProjectBuildingSiteLocation extends Model {
  @property({type: 'string', required: true})
  location: string;
  @property({type: 'number', required: true})
  land_occupancy: number;

  constructor(data?: Partial<BuildingProjectBuildingSiteLocation>) {
    super(data);
  }
}

@model({...REMOVE_ID_SETTING})
export class BuildingProjectOwnershipType extends Model {
  @property({type: 'string', required: true})
  ownership_type_id: string;
  @property({type: 'string'})
  description?: string;
  @property({type: 'string', required: true})
  form_number: string;
  @property({type: 'date', required: true})
  issue_date: Date;
  @property({type: 'string', required: true})
  renewal_code: string;
  @property({type: 'number', required: true})
  building_density: number;

  constructor(data?: Partial<BuildingProjectOwnershipType>) {
    super(data);
  }
}

@model({...REMOVE_ID_SETTING})
export class BuildingProjectPropertyRegistrationDetails extends Model {
  @property({type: 'string', required: true})
  main: string;
  @property({type: 'string', required: true})
  sub: string;
  @property({type: 'string', required: true})
  sector: string;
  @property({type: 'string', required: true})
  part: string;

  constructor(data?: Partial<BuildingProjectPropertyRegistrationDetails>) {
    super(data);
  }
}

@model({...REMOVE_ID_SETTING})
export class BuildingProjectLocationAddress extends Model {
  //  Property Registation details
  @property({required: true})
  property_registration_details: BuildingProjectPropertyRegistrationDetails;

  // Map geo data
  @property({type: 'number'})
  long?: number;
  @property({type: 'number'})
  lat?: number;
  @property({type: 'object'})
  geo_info?: object;

  // Location
  @property({type: 'string', required: true})
  city_id: string;
  @property({type: 'string', required: true})
  municipality_district_id: string;
  @property({type: 'number'})
  area?: number;

  @property({type: 'string', required: false})
  street?: string;
  @property({type: 'string', required: false})
  alley?: string;
  @property({type: 'string', required: false})
  plaque?: string;
  @property({type: 'number', required: false})
  zip_code?: number;
  @property({type: 'boolean', required: false})
  is_village?: boolean;

  constructor(data?: Partial<BuildingProjectLocationAddress>) {
    super(data);
  }
}

@model()
export class BuildingProjectSpecificationFloorItem extends Model {
  @property({type: 'string', required: true})
  floor: number;
  @property({type: 'string', required: true})
  area: number;

  constructor(data?: Partial<BuildingProjectSpecificationFloorItem>) {
    super(data);
  }
}
export type BuildingProjectSpecificationFloorItems =
  BuildingProjectSpecificationFloorItem[];

@model({...REMOVE_ID_SETTING})
export class BuildingProjectSpecification extends Model {
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
  @property.array(BuildingProjectSpecificationFloorItem, {required: true})
  floors_area: BuildingProjectSpecificationFloorItems;

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
  @property({type: 'string', required: true})
  distict_north: string;
  @property({type: 'string', required: true})
  distict_south: string;
  @property({type: 'string', required: true})
  distict_east: string;
  @property({type: 'string', required: true})
  distict_west: string;

  // Building data
  @property({type: 'string', required: true})
  building_priority: string;
  @property({type: 'string', required: true})
  building_type_id: string;
  @property.array(String, {required: true})
  foundation_types: string[];
  @property.array(String, {required: true})
  roof_types: string[];
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
  @property({type: 'boolean', required: true})
  incremental_project: boolean;

  /// TODO: SHOULD OPTIMIZE
  @property({type: 'boolean', required: true})
  two_supervisors: boolean;

  // Quota
  @property({type: 'string'})
  quota_type_id: string;
  @property({type: 'string'})
  quota_value: number;

  constructor(data?: Partial<BuildingProjectSpecification>) {
    super(data);
  }
}

@model({...REMOVE_ID_SETTING})
export class BuildingProjectInvoiceInfo extends Model {
  @property.array(String, {required: true})
  tags: string[];
  @property({type: 'object', required: true})
  meta: AnyObject;

  constructor(data?: Partial<BuildingProjectInvoiceInfo>) {
    super(data);
  }
}

@model()
export class BuildingProjectInvoice extends TimestampModelWithId {
  @property({
    type: 'number',
    required: true,
    jsonSchema: {enum: EnumStatusValues},
  })
  status: EnumStatus;
  @property({required: true})
  invoice: BuildingProjectInvoiceInfo;

  constructor(data?: Partial<BuildingProjectInvoice>) {
    super(data);

    if (this.invoice) {
      this.invoice = new BuildingProjectInvoiceInfo(this.invoice);
    }
    this.status = this.status ?? EnumStatus.ACTIVE;
  }
}
export type BuildingProjectInvoices = BuildingProjectInvoice[];

@model()
export class BuildingProjectJobResult extends TimestampModelWithId {
  @property({type: 'date', required: true})
  published_at: Date;
  @property({type: 'string', required: true})
  job_id: string;
  @property({
    type: 'number',
    required: true,
    jsonSchema: {enum: EnumStatusValues},
  })
  job_status: EnumStatus;
  @property({type: 'string', required: true})
  schedule_id: string;
  @property({
    type: 'number',
    required: true,
    jsonSchema: {enum: EnumStatusValues},
  })
  schedule_status: EnumStatus;
  @property({type: 'date', required: true})
  schedule_created_at: Date;
  @property({type: 'string', required: false})
  schedule_error?: string | null;
  @property.array(String, {required: false})
  selected_users?: string[];

  constructor(data?: Partial<BuildingProjectJobResult>) {
    super(data);
  }
}

@model()
export class BuildingProjectJob extends TimestampModelWithId {
  @property({required: true})
  job_id: string;
  @property({type: 'string', required: false})
  invoice_id?: string;
  @property({
    type: 'number',
    required: true,
    jsonSchema: {enum: EnumStatusValues},
  })
  status: EnumStatus;
  @property({required: false})
  result?: BuildingProjectJobResult;

  constructor(data?: Partial<BuildingProjectJob>) {
    super(data);
    this.status = this.status ?? EnumStatus.ACTIVE;
  }
}
export type BuildingProjectJobs = BuildingProjectJob[];

@model({...REMOVE_ID_SETTING})
export class BuildingProjectCaseNo extends Model {
  @property({
    type: 'string',
    required: true,
    jsonSchema: {pattern: /\d{2}-\d{4}/.source},
  })
  case_no: string;
  @property({type: 'number', required: true})
  prefix: number;
  @property({type: 'number', required: true})
  serial: number;

  constructor(data?: Partial<BuildingProjectCaseNo>) {
    super(data);
  }

  static fromString(caseNo: string, separator = '-'): BuildingProjectCaseNo {
    const [prefix, serial] = caseNo.split(separator).map(x => +x);
    return new BuildingProjectCaseNo({prefix, serial, case_no: caseNo});
  }
}

@model()
export class ProgressStatusItem extends TimestampModelWithId {
  @property({
    type: 'number',
    required: true,
    jsonSchema: {enum: EnumProgressStatusValues},
  })
  progress_status: EnumProgressStatus;
  @property({
    type: 'number',
    required: true,
    jsonSchema: {enum: EnumStatusValues},
  })
  status: EnumStatus;

  constructor(data?: Partial<ProgressStatusItem>) {
    super(data);
    this.status = this.status ?? EnumStatus.ACTIVE;
  }
}
export type ProgressStatusItems = ProgressStatusItem[];

@model({...REMOVE_ID_SETTING})
export class BuildingProjectTSItemUnitInfo extends Model {
  @property({type: 'number', required: true})
  unit_no: number;
  @property({type: 'number', required: true})
  floor: number;
  @property({type: 'number', required: true})
  area: number;
  @property({
    type: 'number',
    required: true,
    jsonSchema: {enum: EnumBuildingUnitDirectionValues},
  })
  direction: EnumBuildingUnitDirection;
  @property({type: 'number', required: true})
  parking_no: number;
  @property({type: 'string', required: true})
  parking_location: string;
  @property({type: 'string', required: true})
  parking_obstructive: string;
  @property({type: 'number', required: true})
  storage_no: number;
  @property({type: 'string', required: true})
  storage_location: string;
  @property({type: 'number', required: true})
  storage_area: number;

  constructor(data?: Partial<BuildingProjectTSItemUnitInfo>) {
    super(data);
  }
}

@model({...REMOVE_ID_SETTING})
export class BuildingProjectTSItemLaboratoryConcrete extends Model {
  @property({type: 'number', required: true})
  consumption_rate: number;
  @property({type: 'number', required: true})
  wc_rate: number;
  @property({type: 'number', required: true})
  concrete_fundation: number;
  @property({type: 'number', required: true})
  concrete_column: number;
  @property({type: 'number', required: true})
  concrete_roof: number;
  @property({type: 'number', required: true})
  fundation_total: number;
  @property({type: 'number', required: true})
  shear_wall_floor: number;
  @property({type: 'number', required: true})
  shear_wall_total: number;
  @property({type: 'number', required: true})
  column_floor: number;
  @property({type: 'number', required: true})
  column_total: number;
  @property({type: 'number', required: true})
  roof_floor: number;
  @property({type: 'number', required: true})
  roof_total: number;
  @property({type: 'number', required: true})
  total: number;
  @property({type: 'boolean', required: true})
  calculated_mix_design: boolean;

  constructor(data?: Partial<BuildingProjectTSItemLaboratoryConcrete>) {
    super(data);
  }
}

@model({...REMOVE_ID_SETTING})
export class BuildingProjectTSItemLaboratoryWelding extends Model {
  @property({type: 'string', required: true})
  braced_frame: string;
  @property({type: 'number', required: true})
  vt: number;
  @property({type: 'number', required: true})
  pt: number;
  @property({type: 'number', required: true})
  mt: number;
  @property({type: 'number', required: true})
  ut: number;
  @property({type: 'number', required: true})
  coating_thickness: number;

  constructor(data?: Partial<BuildingProjectTSItemLaboratoryWelding>) {
    super(data);
  }
}

@model({...REMOVE_ID_SETTING})
export class BuildingProjectTSItemLaboratoryTensile extends Model {
  @property({type: 'string', required: true})
  profile_type: string;
  @property({type: 'string', required: true})
  rebar_manufacture: string;
  @property({type: 'string', required: true})
  rebar_type: string;
  @property({type: 'object', itemType: 'number', required: true})
  rebars: Record<string, number>;
  @property({type: 'number', required: true})
  tests_count: number;

  constructor(data?: Partial<BuildingProjectTSItemLaboratoryTensile>) {
    super(data);
  }
}

@model({...REMOVE_ID_SETTING})
export class BuildingProjectTSItemLaboratoryPolystyrene extends Model {
  @property({type: 'number', required: true})
  samples_count: number;
  @property({type: 'string', required: true})
  water_absorption: string;
  @property({type: 'string', required: true})
  dimensional_stability_test: string;

  constructor(data?: Partial<BuildingProjectTSItemLaboratoryPolystyrene>) {
    super(data);
  }
}

@model({...REMOVE_ID_SETTING})
export class BuildingProjectTSItemLaboratoryElectricity extends Model {
  @property({type: 'number', required: true})
  required_samples_count: number;
  @property({type: 'number', required: true})
  earth_pit_count: number;

  constructor(data?: Partial<BuildingProjectTSItemLaboratoryElectricity>) {
    super(data);
  }
}
export type BuildingProjectTechSpecData =
  | BuildingProjectTSItemUnitInfo
  | BuildingProjectTSItemLaboratoryConcrete
  | BuildingProjectTSItemLaboratoryWelding
  | BuildingProjectTSItemLaboratoryTensile
  | BuildingProjectTSItemLaboratoryPolystyrene
  | BuildingProjectTSItemLaboratoryElectricity;

@model()
export class BuildingProjectTechSpec extends TimestampModelWithId {
  @property({
    type: 'number',
    required: true,
    jsonSchema: {enum: EnumStatusValues},
  })
  status: EnumStatus;
  @property.array(String, {required: true})
  tags: string[];
  @property({type: 'object', required: true})
  data: BuildingProjectTechSpecData;

  constructor(data?: Partial<BuildingProjectTechSpec>) {
    super(data);
    this.status = this.status ?? EnumStatus.ACTIVE;
  }

  markAsRemoved(userId: string): void {
    this.status = EnumStatus.DEACTIVE;
    this.updated = new ModifyStamp({by: userId});
  }
}
export type BuildingProjectTechSpecs = BuildingProjectTechSpec[];

@model()
export class BuildingProjectGroupDetail extends TimestampModelWithId {
  @property({
    type: 'number',
    required: true,
    jsonSchema: {enum: EnumStatusValues},
  })
  status: EnumStatus;
  @property({type: 'string', required: true})
  group_id: string;
  @property({type: 'string', required: true})
  rules_group_id: string;
  @property({type: 'string', required: true})
  sub_group_id: string;
  @property({type: 'string', required: true})
  condition_id: string;

  constructor(data?: Partial<BuildingProjectGroupDetail>) {
    super(data);
    this.status = this.status ?? EnumStatus.ACTIVE;
  }

  markAsRemoved(userId: string): void {
    this.status = EnumStatus.DEACTIVE;
    this.updated = new ModifyStamp({by: userId});
  }
}
export type BuildingProjectGroupDetails = BuildingProjectGroupDetail[];

@model({
  name: 'building_projects',
  settings: {
    indexes: [
      {
        keys: {'case_no.prefix': 1, 'case_no.serial': 2},
        options: {name: 'case_no_uidx', unique: true},
      },
    ],
  },
})
export class BuildingProject extends Entity {
  @property({type: 'string', id: true, generated: true})
  id?: string;
  @property({required: true})
  created: ModifyStamp;
  @property({required: true})
  updated: ModifyStamp;
  @property({required: true, jsonSchema: {enum: EnumStatusValues}})
  status: EnumStatus;
  @property({type: 'string'})
  unique_key?: string;

  @property.array(BuildingProjectGroupDetail, {required: true})
  building_groups: BuildingProjectGroupDetails;

  @property({required: true, jsonSchema: {enum: EnumProgressStatusValues}})
  progress_status: EnumProgressStatus;
  @property.array(ProgressStatusItem)
  progress_status_history: ProgressStatusItems;
  @property({required: true})
  case_no: BuildingProjectCaseNo;
  @property({type: 'date', required: true})
  case_date: Date;
  @property({required: true})
  address: BuildingProjectLocationAddress;
  @property({required: true})
  ownership_type: BuildingProjectOwnershipType;
  @property.array(String, {required: true})
  project_usage_types: string[];
  @property({type: 'string'})
  project_usage_description?: string;
  @property({required: true})
  building_site_location: BuildingProjectBuildingSiteLocation;
  @property({required: true})
  ownership: BuildingProjectOwnership;
  @property.array(BuildingProjectLawyer, {default: []})
  lawyers?: BuildingProjectLawyers;
  @property({required: true})
  specification: BuildingProjectSpecification;
  @property.array(BuildingProjectInvoice, {default: []})
  invoices?: BuildingProjectInvoices;
  @property.array(BuildingProjectJob, {default: []})
  jobs?: BuildingProjectJobs;
  @belongsTo(() => Office, {
    name: 'office',
    keyTo: 'id',
    keyFrom: 'office_id',
  })
  office_id: string;
  @property.array(BuildingProjectAttachmentItem, {false: true})
  attachments: BuildingProjectAttachmentItems;
  @property.array(BuildingProjectStaffItem, {required: false})
  staff?: BuildingProjectStaffItems;
  @property.array(BuildingProjectTechSpec, {
    required: false,
    default: [],
  })
  technical_specifications?: BuildingProjectTechSpecs;

  constructor(data?: Partial<BuildingProject>) {
    super(data);

    // it's because of mongodb-aggregation result
    this.lawyers = this.lawyers?.filter(l => !!l.id);

    this.progress_status =
      this.progress_status ?? EnumProgressStatus.OFFICE_DATA_ENTRY;
    this.status = this.status ?? EnumStatus.ACTIVE;
    this.lawyers = (this.lawyers ?? []).map(l => new BuildingProjectLawyer(l));
    this.invoices = (this.invoices ?? []).map(
      i => new BuildingProjectInvoice(i),
    );
    this.jobs = (this.jobs ?? []).map(j => new BuildingProjectJob(j));
    this.attachments = (this.attachments ?? []).map(
      attachment => new BuildingProjectAttachmentItem(attachment),
    );
    this.staff = this.staff
      ?.filter(x => !!x.id)
      .map(s => new BuildingProjectStaffItem(s));
    this.progress_status_history =
      this.progress_status_history?.map(item => new ProgressStatusItem(item)) ??
      [];
    this.technical_specifications = this.technical_specifications?.map(
      ts => new BuildingProjectTechSpec(ts),
    );
    this.building_groups =
      this.building_groups?.map(grp => new BuildingProjectGroupDetail(grp)) ??
      [];
  }

  static generateUniqueKey = (nId: string, formNo: string) =>
    [
      nId,
      formNo
        .split(/\D/gi)
        .filter(x => !!x)
        .at(-1),
    ].join('-');

  get mainOwner(): BuildingProjectOwner | undefined {
    return this.ownership.owners.find(owner => owner.is_delegate);
  }

  get activeTechnicalSpecifications(): BuildingProjectTechSpecs {
    return (
      this.technical_specifications?.filter(
        x => x.status === EnumStatus.ACTIVE,
      ) ?? []
    );
  }

  get activeBuildingGroupCondition(): BuildingProjectGroupDetail | undefined {
    return this.building_groups?.find(bg => bg.status === EnumStatus.ACTIVE);
  }

  addBuildingGroup(userId: string, newGroup: BuildingProjectGroupDetail): void {
    const now = new ModifyStamp({by: userId});

    // Get last active building group
    const lastActiveBG = this.building_groups?.find(
      bg => bg.status === EnumStatus.ACTIVE,
    );
    if (
      lastActiveBG?.condition_id.toString() ===
        newGroup.condition_id.toString() &&
      lastActiveBG.group_id.toString() === newGroup.group_id.toString() &&
      lastActiveBG.sub_group_id.toString() ===
        newGroup.sub_group_id.toString() &&
      lastActiveBG.rules_group_id.toString() ===
        newGroup.rules_group_id.toString()
    ) {
      return;
    }

    lastActiveBG?.markAsRemoved(userId);
    this.building_groups.push(
      new BuildingProjectGroupDetail({
        ...newGroup,
        updated: now,
        created: now,
        status: EnumStatus.ACTIVE,
      }),
    );
  }

  removeBuildingGroup(userId: string, groupId: string): void {
    const bg = this.building_groups.find(
      bGroup =>
        bGroup.id?.toString() === groupId &&
        bGroup.status === EnumStatus.ACTIVE,
    );
    if (!bg) {
      throw new HttpErrors.NotFound(
        `Building group detial not found, id: ${groupId}`,
      );
    }
    bg.markAsRemoved(userId);
  }

  signRelatedFiles(
    operatorId: string,
    userId: string,
    attachemntField: string,
    status: EnumStatus.REJECTED | EnumStatus.ACCEPTED,
    description?: string,
  ): void {
    const [attachemntFieldCategory] = attachemntField.split('_');
    this.attachments
      .filter(a => {
        const [fieldCategory] = a.field.split('_');
        return (
          fieldCategory === attachemntFieldCategory &&
          a.status !== EnumStatus.DEACTIVE
        );
      })
      .forEach(a =>
        a.signByUserByResponse(operatorId, userId, status, description),
      );
  }

  addStaff(staffItems: BuildingProjectStaffItems): void {
    const requestedUsers = staffItems.reduce<Record<string, string>>(
      (res, item) => ({...res, [item.user_id]: item.field_id.toString()}),
      {},
    );
    // Find active or pending staff requests of the user
    const hasConflict = this.staff?.some(
      staff =>
        requestedUsers[staff.user_id] === staff.field_id.toString() &&
        ![EnumStatus.DEACTIVE, EnumStatus.REJECTED].includes(staff.status),
    );
    if (hasConflict) {
      throw new HttpErrors.UnprocessableEntity(
        'Some requests has already exists',
      );
    }
    this.staff = [...(this.staff ?? []), ...staffItems];
  }

  removeStaff(userId: string, staffId: string): void {
    const staffItem = this.staff?.find(
      s =>
        s.id?.toString() === staffId.toString() &&
        s.status !== EnumStatus.DEACTIVE,
    );
    if (!staffItem) {
      throw new HttpErrors.NotFound(
        `Staff item not found, Staff id: ${staffId}`,
      );
    }
    staffItem.markAsRemoved(userId);
    this.removeStaffSign(userId, staffItem);
    this.updated = new ModifyStamp({by: userId});
  }

  removeStaffSign(userId: string, staff: BuildingProjectStaffItem): void {
    const staffUserId = staff.user_id.toString();
    const now = new ModifyStamp({by: userId});
    this.attachments
      .filter(a => a.status !== EnumStatus.DEACTIVE)
      .forEach(a => {
        if (!a.signes) {
          return;
        }
        a.signes
          .filter(
            s =>
              s.status !== EnumStatus.DEACTIVE &&
              s.user_id.toString() === staffUserId,
          )
          .forEach(s => {
            s.updated = now;
            s.status = EnumStatus.DEACTIVE;
          });
      });
  }

  addInvoice(userId: string, newInvoice: BuildingProjectInvoice): void {
    this.invoices = [...(this.invoices ?? []), newInvoice];
    this.updated = new ModifyStamp({by: userId});
  }

  getInvoiceByIdOrFail(invoiceId: string): BuildingProjectInvoice {
    const result = this.invoices?.find(x => x.id?.toString() === invoiceId);
    if (!result) {
      throw new HttpErrors.NotFound('Invoice not found');
    }
    return result;
  }

  updateInvoice(
    userId: string,
    invoiceId: string,
    data: BuildingProjectInvoiceInfo,
  ): void {
    const invoices = this.invoices ?? [];
    const index = invoices.findIndex(
      x => x.id?.toString() === invoiceId && x.status === EnumStatus.ACTIVE,
    );
    if (index === -1) {
      throw new HttpErrors.NotFound('Invoice not found');
    }

    const now = new ModifyStamp({by: userId});
    const oldInvoice = invoices[index];
    invoices[index] = new BuildingProjectInvoice({
      ...oldInvoice,
      updated: now,
      invoice: data,
    });

    this.invoices = invoices;
    this.updated = now;
  }

  addNewJob(userId: string, jobId: string, invoiceId?: string): void {
    const jobs = this.jobs ?? [];

    // Find existing job
    const oldJob = jobs.find(
      job => job.job_id === jobId && job.status === EnumStatus.ACTIVE,
    );
    if (oldJob) {
      throw new HttpErrors.NotAcceptable('Job already registered');
    }

    // Add new job
    const now = new ModifyStamp({by: userId});
    jobs.push(
      new BuildingProjectJob({
        created: now,
        updated: now,
        invoice_id: invoiceId,
        job_id: jobId,
      }),
    );
    this.jobs = jobs;
  }

  updateJobOrFail(
    userId: string,
    jobId: string,
    result: BuildingProjectJobResult,
  ): void {
    const jobs = this.jobs ?? [];
    const jobIndex = jobs.findIndex(
      j => j.job_id.toString() === jobId.toString(),
    );
    if (jobIndex === -1) {
      throw new HttpErrors.NotFound('Job not found');
    }
    jobs[jobIndex] = new BuildingProjectJob({
      ...jobs[jobIndex],
      updated: new ModifyStamp({by: userId}),
      result,
    });
    this.jobs = jobs;
  }

  updateAttachments(
    userId: string,
    newAttachments: {fileId: string; field: string}[],
    forceValidation = true,
    meta: Record<string, string> = {},
  ): void {
    const now = new ModifyStamp({by: userId});
    for (const attachment of newAttachments) {
      const oldAttachment = this.attachments.find(
        a => a.field === attachment.field && a.status === EnumStatus.ACTIVE,
      );

      // Check for selected staffs
      if (oldAttachment) {
        if (forceValidation && oldAttachment.isLocked) {
          throw new HttpErrors.UnprocessableEntity(
            `Field is locked, Field: ${attachment.field}`,
          );
        }
        oldAttachment.markAsRemoved(userId);
      }

      this.attachments.push(
        new BuildingProjectAttachmentItem({
          field: attachment.field,
          file_id: attachment.fileId,
          created: now,
          updated: now,
          comment: meta[attachment.field],
        }),
      );
    }
  }

  removeUploadedFile(userId: string, fileId: string): void {
    const file = this.attachments.find(
      a =>
        a.id?.toString() === fileId.toString() &&
        a.status === EnumStatus.ACTIVE &&
        !a.isLocked,
    );
    if (!file) {
      throw new HttpErrors.NotFound(`File not found, id: ${fileId}`);
    }
    file.markAsRemoved(userId);
  }

  get checkAllStaffIsAccpeted(): boolean {
    return this.staff?.every(s => s.status !== EnumStatus.PENDING) ?? true;
  }

  get allStaffFields(): string[] {
    return (
      this.staff
        ?.filter(s =>
          [EnumStatus.ACCEPTED, EnumStatus.PENDING].includes(s.status),
        )
        .map(s => s.field_id) ?? []
    );
  }

  get userCanModifyProject(): boolean {
    return [
      EnumProgressStatus.OFFICE_DATA_ENTRY,
      EnumProgressStatus.OFFICE_DATA_CONFIRMED,
    ].includes(this.progress_status);
  }

  commitState(
    userId: string,
    newState: EnumProgressStatus,
    meta: {blockChecker?: BlockCheckerService} = {},
  ): void {
    const commitCheckFunc = {
      [EnumProgressStatus.OFFICE_DATA_ENTRY]: () => true,
      [EnumProgressStatus.OFFICE_DATA_CONFIRMED]: () => {
        return (
          this.progress_status === EnumProgressStatus.OFFICE_DATA_ENTRY &&
          this.checkAllStaffIsAccpeted &&
          meta.blockChecker?.analyze(
            this,
            EnumConditionMode.CHECK_ENGINEERS,
            this.allStaffFields,
          )
        );
      },
      [EnumProgressStatus.OFFICE_DESIGNERS_LIST_CONFIRMED]: () => false,
      [EnumProgressStatus.CONTROL_QUEUE_CONFIRMED]: () => false,
      undefined: () => false,
    }[this.progress_status];

    if (!commitCheckFunc()) {
      throw new HttpErrors.UnprocessableEntity('Commit not acceptable');
    }

    const now = new ModifyStamp({by: userId});
    this.progress_status = newState;
    this.progress_status_history = [
      ...this.progress_status_history,
      new ProgressStatusItem({
        created: now,
        updated: now,
        progress_status: newState,
      }),
    ];
  }

  setStaffResponse(
    userId: string,
    staffId: string,
    status: EnumStatus,
    description?: string,
    validateUser = true,
  ): BuildingProjectStaffItem {
    const staff = this.staff?.find(
      s => s.id?.toString() === staffId && s.status === EnumStatus.PENDING,
    );
    if (!staff) {
      throw new HttpErrors.NotFound(
        `Staff request not found or already responded to, Staff id: ${staffId}`,
      );
    }
    if (validateUser && userId !== staff.user_id) {
      throw new HttpErrors.UnprocessableEntity(
        `Operation is not accpeted for the user, User id: ${userId}`,
      );
    }
    staff.setResponse(userId, status, description);
    return staff;
  }

  signAttachments(
    operatorId: string,
    userId: string,
    files: string[],
    fileFieldMapper: Array<{id: string; field: string}>,
    status: EnumStatus.ACCEPTED | EnumStatus.REJECTED,
    description?: string,
  ): void {
    files.forEach(fileId => {
      const file = this.attachments.find(
        attachment => attachment.id!.toString() === fileId,
      );
      if (!file) {
        throw new HttpErrors.NotFound(`File not found, id: ${fileId}`);
      }

      const userStaff = this.staff?.find(staff => {
        const fieldId =
          fileFieldMapper.find(
            f => f.id.toString() === staff.field_id.toString(),
          )?.field ?? '';

        // Extract category part of fields
        const [fileFieldCategory] = file.field.split('_');
        const [fieldCategory] = fieldId.split('_');

        // Check criteria
        return (
          staff.user_id === userId &&
          staff.status !== EnumStatus.DEACTIVE &&
          fieldCategory === fileFieldCategory
        );
      });
      if (!userStaff) {
        throw new HttpErrors.UnprocessableEntity('Invalid user field');
      }
      file.signByUserByResponse(operatorId, userId, status, description);
    });

    this.updated = new ModifyStamp({by: operatorId});
  }

  unsignAttachment(userId: string, fileId: string): void {
    const file = this.attachments.find(
      fileItem => fileItem.id?.toString() === fileId,
    );
    if (!file) {
      throw new HttpErrors.NotFound(`File not found, id: ${fileId}`);
    }
    file.removeUserSign(userId, userId);
    this.updated = new ModifyStamp({by: userId});
  }

  getStaffDataByUserId(userId: string): BuildingProjectStaffItem[] {
    return (
      this.staff?.filter(
        s =>
          s.user_id === userId &&
          s.status === EnumStatus.ACCEPTED &&
          s.response?.status === EnumStatus.ACCEPTED,
      ) ?? []
    );
  }

  markAsRemoved(userId: string): void {
    const allowedStatus = [EnumProgressStatus.OFFICE_DATA_ENTRY];
    if (!allowedStatus.includes(this.progress_status)) {
      throw new HttpErrors.UnprocessableEntity(
        `Invalid project state, state: ${this.progress_status}`,
      );
    }
    const now = new ModifyStamp({by: userId});
    this.status = EnumStatus.DEACTIVE;
    this.updated = now;
  }

  addTechnicalSpecItem(userId: string, data: BuildingProjectTechSpecs): void {
    const now = new ModifyStamp({by: userId});
    data = data.map(
      x => new BuildingProjectTechSpec({...x, created: now, updated: now}),
    );
    this.technical_specifications = [
      ...(this.technical_specifications ?? []),
      ...data,
    ];
    this.updated = now;
  }

  getActiveTechnicalItems(
    tag: EnumBuildingProjectTechSpecItems,
  ): BuildingProjectTechSpecs {
    return (
      this.technical_specifications?.filter(
        x => x.tags.includes(tag) && x.status === EnumStatus.ACTIVE,
      ) ?? []
    );
  }

  removeTechnicalSpecItem(userId: string, id: string): void {
    const items = this.technical_specifications ?? [];
    const index = items.findIndex(
      x => x.id?.toString() === id.toString() && x.status === EnumStatus.ACTIVE,
    );
    const item =
      index > -1 ? new BuildingProjectTechSpec(items[index]) : undefined;
    if (!item) {
      throw new HttpErrors.NotFound(
        `Item not found, Specification Item id: ${id}`,
      );
    }
    item.markAsRemoved(userId);
    items[index] = item;
    this.technical_specifications = items;
    this.updated = new ModifyStamp({by: userId});
  }

  setAttachmentResponse(
    userId: string,
    attachmentId: string,
    status: EnumStatus.ACCEPTED | EnumStatus.REJECTED,
    comment?: string,
  ): void {
    const attachment = this.attachments.find(
      a =>
        a.id?.toString() === attachmentId.toString() &&
        a.status === EnumStatus.ACTIVE,
    );
    if (!attachment) {
      throw new HttpErrors.UnprocessableEntity(
        `Set attachment response failed, id: ${attachmentId}`,
      );
    }
    attachment.setResponse(userId, status, comment);
    this.updated = new ModifyStamp({by: userId});
  }

  getDelegateOwner(): BuildingProjectOwner | undefined {
    return this.ownership.owners.find(x => x.is_delegate);
  }
}

export interface BuildingProjectRelations {
  office?: Office;
}
export type BuildingProjectWithRelations = BuildingProject &
  BuildingProjectRelations;
