/* eslint-disable @typescript-eslint/naming-convention */
import {
  AnyObject,
  belongsTo,
  Entity,
  Model,
  model,
  property,
} from '@loopback/repository';
import {
  EnumStatus,
  EnumStatusValues,
  ModifyStamp,
  REMOVE_ID_SETTING,
  TimestampModelWithId,
} from './common';
import {HttpErrors} from '@loopback/rest';
import {Office} from './office.model';
import {ObjectId} from 'bson';

export enum EnumProgressStatus {
  OFFICE_REGISTRATION_DATA = 0,
  OFFICE_FILE_UPLOAD = 1,
}
export const EnumProgressStatusValues = Object.values(EnumProgressStatus);

@model({...REMOVE_ID_SETTING})
export class BuildingProjectAttachmentItem extends Model {
  @property({type: 'string', required: true})
  id: string;
  @property({type: 'string', required: true})
  field: string;
  @property({type: 'string', required: true})
  file_id: string;
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

  constructor(data?: Partial<BuildingProjectAttachmentItem>) {
    super(data);
    this.id = this.id ?? new ObjectId();
    this.status = this.status ?? EnumStatus.ACTIVE;
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

  constructor(data?: Partial<BuildingProjectLawyer>) {
    super(data);
    this.status = this.status ?? EnumStatus.ACTIVE;
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
  @property({type: 'string', required: true})
  issue_date: string;
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

  @property({type: 'string'})
  street?: string;
  @property({type: 'string'})
  alley?: string;
  @property({type: 'string'})
  plaque?: string;
  @property({type: 'number'})
  zip_code?: number;

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
  @property({required: true, jsonSchema: {enum: EnumProgressStatusValues}})
  progress_status: EnumProgressStatus;
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
  @belongsTo(() => Office, {name: 'office', keyTo: 'id'})
  office_id: string;
  @property.array(BuildingProjectAttachmentItem, {false: true})
  attachments: BuildingProjectAttachmentItems;

  constructor(data?: Partial<BuildingProject>) {
    super(data);
    this.progress_status =
      this.progress_status ?? EnumProgressStatus.OFFICE_REGISTRATION_DATA;
    this.status = this.status ?? EnumStatus.ACTIVE;
    this.lawyers = (this.lawyers ?? []).map(l => new BuildingProjectLawyer(l));
    this.invoices = (this.invoices ?? []).map(
      i => new BuildingProjectInvoice(i),
    );
    this.jobs = (this.jobs ?? []).map(j => new BuildingProjectJob(j));
    this.attachments = this.attachments ?? [];
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

  updateAttachments(
    userId: string,
    newAttachments: {fileId: string; field: string}[],
  ): void {
    const now = new ModifyStamp({by: userId});
    for (const attachment of newAttachments) {
      const oldAttachment = this.attachments.find(
        a => a.field === attachment.field && a.status === EnumStatus.ACTIVE,
      );
      if (oldAttachment) {
        oldAttachment.updated = now;
        oldAttachment.status = EnumStatus.DEACTIVE;
      }
      this.attachments.push(
        new BuildingProjectAttachmentItem({
          field: attachment.field,
          file_id: attachment.fileId,
          created: now,
          updated: now,
        }),
      );
    }
  }

  removeUploadedFile(userId: string, fileId: string): void {
    const file = this.attachments.find(
      a => a.id.toString() === fileId && a.status === EnumStatus.ACTIVE,
    );
    if (!file) {
      throw new HttpErrors.NotFound(`File not found, id: ${fileId}`);
    }
    file.status = EnumStatus.DEACTIVE;
    file.updated = new ModifyStamp({by: userId});
  }
}

export interface ProjectRelations {
  office?: Office;
}
export type ProjectWithRelations = BuildingProject & ProjectRelations;
