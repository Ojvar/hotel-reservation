/* eslint-disable @typescript-eslint/naming-convention */
import {AnyObject, Entity, Model, model, property} from '@loopback/repository';
import {
  EnumStatus,
  EnumStatusValues,
  ModifyStamp,
  REMOVE_ID_SETTING,
  TimestampModelWithId,
} from './common';
import {Attachment} from '../lib-models/src';
import {HttpErrors} from '@loopback/rest';

@model({})
export class BuildingProjectLawyer extends TimestampModelWithId {
  @property({required: true})
  user_id: string;
  @property({required: true})
  power_of_attorney_number: string;
  @property({type: 'date'})
  power_of_attorney_date?: Date;
  @property({})
  description?: string;
  @property({
    required: true,
    jsonSchema: {enum: EnumStatusValues},
  })
  status: EnumStatus;
  @property({})
  attachments?: Attachment;

  constructor(data?: Partial<BuildingProjectLawyer>) {
    super(data);
    this.status = this.status ?? EnumStatus.ACTIVE;
  }
}
export type BuildingProjectLawyers = BuildingProjectLawyer[];

@model({})
export class BuildingProjectOwner extends TimestampModelWithId {
  @property({required: true})
  user_id: string;
  @property({required: true})
  address: string;
  @property({required: true})
  is_delegate: boolean;
  @property({
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
  @property({})
  attachments: Attachment;

  constructor(data?: Partial<BuildingProjectOwnership>) {
    super(data);
  }
}

@model({...REMOVE_ID_SETTING})
export class BuildingProjectBuildingSiteLocation extends Model {
  @property({required: true})
  location: string;
  @property({required: true})
  land_occupancy: number;

  constructor(data?: Partial<BuildingProjectBuildingSiteLocation>) {
    super(data);
  }
}

@model({...REMOVE_ID_SETTING})
export class BuildingProjectOwnershipType extends Model {
  @property({required: true})
  ownership_type_id: string;
  @property({})
  description?: string;
  @property({required: true})
  form_number: string;
  @property({required: true})
  issue_date: string;
  @property({required: true})
  renewal_code: string;
  @property({required: true})
  building_density: number;

  constructor(data?: Partial<BuildingProjectOwnershipType>) {
    super(data);
  }
}

@model({...REMOVE_ID_SETTING})
export class BuildingProjectPropertyRegistrationDetails extends Model {
  @property({required: true})
  main: string;
  @property({required: true})
  sub: string;
  @property({required: true})
  sector: string;
  @property({required: true})
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
  @property({required: true})
  city_id: string;
  @property({required: true})
  municipality_district_id: string;
  @property({type: 'number'})
  area?: number;

  @property({type: 'string'})
  street?: string;
  @property({type: 'string'})
  alley?: string;
  @property({type: 'string'})
  plaque?: string;
  @property({type: 'number'})
  zip_code?: number;

  // // Additional data
  // @property({  required: true })
  // type: string;

  constructor(data?: Partial<BuildingProjectLocationAddress>) {
    super(data);
  }
}

@model({...REMOVE_ID_SETTING})
export class BuildingProjectSpecification extends Model {
  // Keep all descriptions for all fields
  @property({type: 'object', items: 'string', required: true})
  descriptions: Record<string, string>;

  // Meta data
  @property({type: 'object'})
  meta?: Record<string, string | number>;

  // Project data
  @property({required: true})
  ground_area_before: number;
  @property({required: true})
  ground_area_after: number;
  @property({required: true})
  total_area: number;
  @property({required: true})
  elevator_stops: number;
  @property({required: true})
  total_floors: number;
  @property({required: true})
  commercial_units: number;
  @property({required: true})
  residental_units: number;
  @property({required: true})
  total_units: number;
  @property({required: true})
  parking_count: number;
  @property({required: true})
  house_storage_count: number;

  // Districts data
  @property({required: true})
  distict_north: number;
  @property({required: true})
  distict_south: number;
  @property({required: true})
  distict_east: number;
  @property({required: true})
  distict_west: number;

  // Building data
  @property({required: true})
  building_priority: string;
  @property({required: true})
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
  @property({required: true})
  polystyrene: boolean;
  @property({required: true})
  underground: boolean;
  @property({required: true})
  dilapidated: boolean;
  @property({required: true})
  incremental_project: boolean;

  /// TODO: SHOULD OPTIMIZE
  @property({type: 'boolean', required: true})
  two_supervisors: boolean;

  // Quota
  @property({})
  quota_type_id: string;
  @property({})
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
  @property({required: true})
  published_at: Date;
  @property({required: true})
  job_id: string;
  @property({required: true, jsonSchema: {enum: EnumStatusValues}})
  job_status: EnumStatus;
  @property({required: true})
  schedule_id: string;
  @property({required: true})
  schedule_status: EnumStatus;
  @property({required: true})
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
  @property({required: true, jsonSchema: {enum: EnumStatusValues}})
  status: EnumStatus;
  @property({required: false})
  result?: BuildingProjectJobResult;

  constructor(data?: Partial<BuildingProjectJob>) {
    super(data);
    this.status = this.status ?? EnumStatus.ACTIVE;
  }
}
export type BuildingProjectJobs = BuildingProjectJob[];

@model({
  name: 'building_projects',
  settings: {
    indexes: [
      {keys: {case_no: 1}, options: {name: 'case_no_uidx', unique: true}},
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
  @property({
    required: true,
    jsonSchema: {enum: EnumStatusValues},
  })
  status: EnumStatus;

  @property({required: true})
  case_no: string;
  @property({required: true})
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

  constructor(data?: Partial<BuildingProject>) {
    super(data);
    this.status = this.status ?? EnumStatus.ACTIVE;
    this.lawyers = this.lawyers ?? [];
    this.invoices = this.invoices ?? [];
    this.jobs = this.jobs ?? [];
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

  updateJobOfFail(
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
}

export interface ProjectRelations {}
export type ProjectWithRelations = BuildingProject & ProjectRelations;
