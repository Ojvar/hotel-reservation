/* eslint-disable @typescript-eslint/naming-convention */
import {AnyObject, Model, model, property} from '@loopback/repository';
import {
  BuildingProject,
  BuildingProjectAttachmentItem,
  BuildingProjectBuildingSiteLocation,
  BuildingProjectInvoiceInfo,
  BuildingProjectLawyer,
  BuildingProjectLocationAddress,
  BuildingProjectOwner,
  BuildingProjectOwnership,
  BuildingProjectOwnershipType,
  BuildingProjectPropertyRegistrationDetails,
  BuildingProjectSpecification,
  EnumProgressStatus,
  EnumProgressStatusValues,
  EnumStatus,
  EnumStatusValues,
  Profile,
} from '../models';
import {FileInfoDTO} from '../lib-file-service/src';

@model()
export class FileTokenRequestDTO extends Model {
  @property.array(String, {
    required: true,
    jsonSchema: {minLength: 1, maxLength: 30},
  })
  allowed_files: string[];

  constructor(data?: Partial<FileTokenRequestDTO>) {
    super(data);
  }
}

@model()
export class BuildingProjectFilter extends Model {
  @property({
    type: 'number',
    required: true,
    jsonSchema: {enum: EnumStatusValues},
  })
  status: EnumStatus;
  @property({type: 'string', required: true})
  office_id: string;
  @property({type: 'string', required: true})
  user_id: string;

  constructor(data?: Partial<BuildingProjectFilter>) {
    super(data);
  }
}

@model()
export class UpdateInvoiceRequestDTO extends Model {
  @property.array(String, {required: true})
  tags: string[];
  @property({type: 'object', required: true})
  meta: AnyObject;

  constructor(data?: Partial<UpdateInvoiceRequestDTO>) {
    super(data);
  }

  toModel(): BuildingProjectInvoiceInfo {
    return new BuildingProjectInvoiceInfo({meta: this.meta, tags: this.tags});
  }
}

@model()
export class BuildingProjectRegistrationCodeDTO extends Model {
  @property({type: 'string'})
  tracking_code: string;

  constructor(data?: Partial<BuildingProjectRegistrationCodeDTO>) {
    super(data);
  }
}

@model({})
export class BuildingProjectPropRegDetailsDTO extends Model {
  @property({type: 'string'})
  main: string;
  @property({type: 'string'})
  sub: string;
  @property({type: 'string'})
  sector: string;
  @property({type: 'string'})
  part: string;

  constructor(data?: Partial<BuildingProjectPropRegDetailsDTO>) {
    super(data);
  }

  static fromModel(
    data: BuildingProjectPropertyRegistrationDetails,
  ): BuildingProjectPropRegDetailsDTO {
    return new BuildingProjectPropRegDetailsDTO({
      main: data.main,
      sub: data.sub,
      sector: data.sector,
      part: data.part,
    });
  }
}

@model({})
export class BuildingProjectLocationAddressDTO extends Model {
  //  Property Registation details
  @property()
  property_registration_details: BuildingProjectPropRegDetailsDTO;

  // Map geo data
  @property({type: 'number'})
  long?: number;
  @property({type: 'number'})
  lat?: number;
  @property({type: 'object'})
  geo_info?: object;

  // Location
  @property({type: 'string'})
  city_id: string;
  @property({type: 'string'})
  municipality_district_id: string;
  @property({type: 'number'})
  area?: number;

  @property({type: 'string'})
  street: string;
  @property({type: 'string'})
  alley: string;
  @property({type: 'string'})
  plaque: string;
  @property({type: 'number'})
  zip_code: number;

  constructor(data?: Partial<BuildingProjectLocationAddressDTO>) {
    super(data);
  }

  static fromModel(
    data: BuildingProjectLocationAddress,
  ): BuildingProjectLocationAddressDTO {
    return new BuildingProjectLocationAddressDTO({
      property_registration_details: BuildingProjectPropRegDetailsDTO.fromModel(
        data.property_registration_details,
      ),
      long: data.long,
      lat: data.lat,
      geo_info: data.geo_info,
      city_id: data.city_id,
      municipality_district_id: data.municipality_district_id,
      area: data.area,
      street: data.street,
      alley: data.alley,
      plaque: data.plaque,
      zip_code: data.zip_code,
    });
  }
}

@model({})
export class BuildingProjectOwnershipTypeDTO extends Model {
  @property({type: 'string'})
  ownership_type_id: string;
  @property({type: 'string', required: false})
  description?: string;
  @property({type: 'string'})
  form_number: string;
  @property({type: 'string'})
  issue_date: string;
  @property({type: 'string'})
  renewal_code: string;
  @property({type: 'string'})
  building_density: number;

  constructor(data?: Partial<BuildingProjectOwnershipTypeDTO>) {
    super(data);
  }

  static fromModel(
    data: BuildingProjectOwnershipType,
  ): BuildingProjectOwnershipTypeDTO {
    return new BuildingProjectOwnershipTypeDTO({
      ownership_type_id: data.ownership_type_id,
      description: data.description,
      form_number: data.form_number,
      issue_date: data.issue_date,
      renewal_code: data.renewal_code,
      building_density: data.building_density,
    });
  }
}

@model({})
export class BuildingProjectBuildingSiteLocationDTO extends Model {
  @property({})
  location: string;
  @property({})
  land_occupancy: number;

  constructor(data?: Partial<BuildingProjectBuildingSiteLocationDTO>) {
    super(data);
  }

  static fromModel(
    data: BuildingProjectBuildingSiteLocation,
  ): BuildingProjectBuildingSiteLocationDTO {
    return new BuildingProjectBuildingSiteLocationDTO({
      location: data.location,
      land_occupancy: data.land_occupancy,
    });
  }
}

@model({})
export class BuildingProjectOwnerDTO extends Model {
  @property({})
  id: string;
  @property({})
  created_at: Date;
  @property({})
  updated_at: Date;
  @property({})
  user_id: string;
  @property({})
  address: string;
  @property({})
  is_delegate: boolean;
  @property({jsonSchema: {enum: EnumStatusValues}})
  status: EnumStatus;
  @property({type: 'object', required: false})
  profile?: Partial<Profile>;

  constructor(data?: Partial<BuildingProjectOwnerDTO>) {
    super(data);
  }

  static fromModel(
    data: BuildingProjectOwner & {profile?: Profile},
  ): BuildingProjectOwnerDTO {
    return new BuildingProjectOwnerDTO({
      id: data.id,
      created_at: data.created.at,
      updated_at: data.updated.at,
      user_id: data.user_id,
      address: data.address,
      is_delegate: data.is_delegate,
      status: data.status,
      profile: new Profile({
        first_name: data.profile?.first_name,
        last_name: data.profile?.last_name,
        n_in: data.profile?.n_in,
        mobile: data.profile?.mobile,
      }),
    });
  }
}
export type BuildingProjectOwnersDTO = BuildingProjectOwnerDTO[];

@model({})
export class BuildingProjectOwnershipDTO extends Model {
  @property.array(BuildingProjectOwnerDTO, {})
  owners: BuildingProjectOwnersDTO;
  @property({})
  has_partners: boolean;

  constructor(data?: Partial<BuildingProjectOwnershipDTO>) {
    super(data);
  }

  static fromModel(
    data: BuildingProjectOwnership,
  ): BuildingProjectOwnershipDTO {
    return new BuildingProjectOwnershipDTO({
      owners: data.owners.map(BuildingProjectOwnerDTO.fromModel),
      has_partners: data.has_partners,
    });
  }
}

@model({})
export class BuildingProjectLawyerDTO extends Model {
  @property({type: 'string'})
  id: string;
  @property({type: 'date'})
  created_at: Date;
  @property({type: 'date'})
  updated_at: Date;
  @property({required: true})
  user_id: string;
  @property({required: true})
  power_of_attorney_number: string;
  @property({type: 'date', required: false})
  power_of_attorney_date?: Date;
  @property({type: 'string', required: false})
  description?: string;
  @property({
    type: 'number',
    required: true,
    jsonSchema: {enum: EnumStatusValues},
  })
  status: EnumStatus;
  @property({})
  profile: Profile;

  constructor(data?: Partial<BuildingProjectLawyerDTO>) {
    super(data);
  }

  static fromModel(
    data: BuildingProjectLawyer & {profile?: Profile},
  ): BuildingProjectLawyerDTO {
    return new BuildingProjectLawyerDTO({
      id: data.id,
      created_at: data.created.at,
      updated_at: data.updated.at,
      status: data.status,
      user_id: data.user_id,
      power_of_attorney_date: data.power_of_attorney_date,
      power_of_attorney_number: data.power_of_attorney_number,
      description: data.description,
      profile: new Profile({
        first_name: data.profile?.first_name,
        last_name: data.profile?.last_name,
        n_in: data.profile?.n_in,
        mobile: data.profile?.mobile,
      }),
    });
  }
}
export type BuildingProjectLawyersDTO = BuildingProjectLawyerDTO[];

@model({})
export class BuildingProjectSpecificationDTO extends Model {
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

  static fromModel(
    data: BuildingProjectSpecification,
  ): BuildingProjectSpecificationDTO {
    return new BuildingProjectSpecificationDTO({
      descriptions: data.descriptions,
      meta: data.meta,
      ground_area_before: data.ground_area_before,
      ground_area_after: data.ground_area_after,
      total_area: data.total_area,
      elevator_stops: data.elevator_stops,
      total_floors: data.total_floors,
      commercial_units: data.commercial_units,
      residental_units: data.residental_units,
      total_units: data.total_units,
      parking_count: data.parking_count,
      house_storage_count: data.house_storage_count,
      distict_north: data.distict_north,
      distict_south: data.distict_south,
      distict_east: data.distict_east,
      distict_west: data.distict_west,
      building_priority: data.building_priority,
      building_type_id: data.building_type_id,
      foundation_types: data.foundation_types,
      root_types: data.root_types,
      floor_access_systems: data.floor_access_systems,
      building_frontages: data.building_frontages,
      roof_cover_types: data.roof_cover_types,
      window_types: data.window_types,
      cooling_system_types: data.cooling_system_types,
      heating_system_types: data.heating_system_types,
      sewage_disposals: data.sewage_disposals,
      earth_connection_types: data.earth_connection_types,
      polystyrene: data.polystyrene,
      underground: data.underground,
      dilapidated: data.dilapidated,
      incremental_project: data.incremental_project,
      two_supervisors: data.two_supervisors,
      quota_type_id: data.quota_type_id,
      quota_value: data.quota_value,
    });
  }
}

@model()
export class BuildingProjectDTO extends Model {
  @property({type: 'string'})
  id: string;
  @property({type: 'date'})
  created_at: Date;
  @property({type: 'date'})
  updated_at: Date;
  @property({type: 'number', jsonSchema: {enum: EnumStatusValues}})
  status: EnumStatus;
  @property({type: 'number', jsonSchema: {enum: EnumProgressStatusValues}})
  progress_status: EnumProgressStatus;
  @property({type: 'string'})
  case_no: string;
  @property({type: 'date'})
  case_date: Date;
  @property()
  address: BuildingProjectLocationAddressDTO;
  @property()
  ownership_type: BuildingProjectOwnershipTypeDTO;

  @property.array(String)
  project_usage_types: string[];
  @property({type: 'string', required: false})
  project_usage_description?: string;
  @property()
  building_site_location: BuildingProjectBuildingSiteLocationDTO;
  @property.array(BuildingProjectLawyerDTO)
  lawyers?: BuildingProjectLawyersDTO;
  @property()
  ownership: BuildingProjectOwnershipDTO;
  @property()
  specification: BuildingProjectSpecificationDTO;

  constructor(data?: Partial<BuildingProjectDTO>) {
    super(data);
  }

  static fromModel(data: BuildingProject): BuildingProjectDTO {
    return new BuildingProjectDTO({
      id: data.id,
      status: data.status,
      progress_status: data.prgress_status,
      created_at: data.created.at,
      updated_at: data.updated.at,
      case_no: data.case_no.case_no,
      case_date: data.case_date,
      address: BuildingProjectLocationAddressDTO.fromModel(data.address),
      ownership_type: BuildingProjectOwnershipTypeDTO.fromModel(
        data.ownership_type,
      ),
      building_site_location: BuildingProjectBuildingSiteLocationDTO.fromModel(
        data.building_site_location,
      ),
      project_usage_description: data.project_usage_description,
      project_usage_types: data.project_usage_types,
      lawyers: data.lawyers?.map(BuildingProjectLawyerDTO.fromModel),
      ownership: BuildingProjectOwnershipDTO.fromModel(data.ownership),
      specification: BuildingProjectSpecificationDTO.fromModel(
        data.specification,
      ),
    });
  }
}
export type BuildingProjectsDTO = BuildingProjectDTO[];

@model()
export class AddNewJobRequestDTO extends Model {
  @property({type: 'string', required: true})
  job_id: string;
  @property({type: 'string', required: false})
  invoice_id?: string;

  constructor(data?: Partial<AddNewJobRequestDTO>) {
    super(data);
  }
}

@model()
export class BuildingProjectAttachmentDTO extends Model {
  @property({type: 'string'})
  id: string;
  @property({type: 'string'})
  file_id: string;
  @property({type: 'date'})
  created_at: Date;
  @property({type: 'string'})
  field: string;
  @property({type: 'string'})
  file_name: string;
  @property({type: 'number'})
  file_size: number;
  @property({type: 'string'})
  access_token: string;
  @property({type: 'string'})
  access_url: string;
  @property({type: 'string'})
  mime: string;

  constructor(data?: Partial<BuildingProjectAttachmentDTO>) {
    super(data);
  }

  static fromModel(
    data: BuildingProjectAttachmentItem & {fileInfo: FileInfoDTO | undefined},
  ): BuildingProjectAttachmentDTO {
    return new BuildingProjectAttachmentDTO({
      id: data.id,
      file_id: data.file_id,
      field: data.field,
      file_name: data.fileInfo?.original_name,
      file_size: data.fileInfo?.size,
      mime: data.fileInfo?.mime,
      access_url: data.fileInfo?.access_url,
      access_token: data.fileInfo?.access_token,
    });
  }
}
export type BuildingProjectAttachmentsDTO = BuildingProjectAttachmentDTO[];
