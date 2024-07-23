/* eslint-disable @typescript-eslint/naming-convention */
import {AnyObject, Model, model, property} from '@loopback/repository';
import {
  BuildingProject,
  BuildingProjectBuildingSiteLocation,
  BuildingProjectInvoiceInfo,
  BuildingProjectLawyer,
  BuildingProjectLocationAddress,
  BuildingProjectOwner,
  BuildingProjectOwnership,
  BuildingProjectOwnershipType,
  BuildingProjectPropertyRegistrationDetails,
  EnumStatus,
  EnumStatusValues,
  Profile,
} from '../models';

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
  @property({})
  ownership_type_id: string;
  @property({required: false})
  description?: string;
  @property({})
  form_number: string;
  @property({})
  issue_date: string;
  @property({})
  renewal_code: string;
  @property({})
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
      profile: {
        first_name: data.profile?.first_name,
        last_name: data.profile?.last_name,
        n_in: data.profile?.n_in,
        mobile: data.profile?.mobile,
      },
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

  /// TODO: change file type
  @property({required: false})
  attachments: AnyObject;

  constructor(data?: Partial<BuildingProjectOwnershipDTO>) {
    super(data);
  }

  static fromModel(
    data: BuildingProjectOwnership,
  ): BuildingProjectOwnershipDTO {
    return new BuildingProjectOwnershipDTO({
      owners: data.owners.map(BuildingProjectOwnerDTO.fromModel),
      has_partners: data.has_partners,
      //// TODO: Attachments should be files info list
      attachments: data.attachments,
    });
  }
}

@model({})
export class BuildingProjectLawyerDTO extends Model {
  id: string;
  created_at: Date;
  updated_at: Date;
  @property({required: true})
  user_id: string;
  /// TODO: get user information
  @property({})
  user_profile: AnyObject;

  @property({required: true})
  power_of_attorney_number: string;
  @property({type: 'date', required: false})
  power_of_attorney_date?: Date;
  @property({required: false})
  description?: string;
  @property({
    required: true,
    jsonSchema: {enum: EnumStatusValues},
  })
  status: EnumStatus;
  /// TODO: SET type
  @property({required: false})
  attachments?: AnyObject;

  @property({type: 'object'})
  profile: Partial<Profile>;

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
      /// TODO: Get user profile data
      user_profile: {},
      power_of_attorney_date: data.power_of_attorney_date,
      power_of_attorney_number: data.power_of_attorney_number,
      description: data.description,
      /// TODO: Get attachments data
      attachments: {},

      profile: {
        first_name: data.profile?.first_name,
        last_name: data.profile?.last_name,
        n_in: data.profile?.n_in,
        mobile: data.profile?.mobile,
      },
    });
  }
}
export type BuildingProjectLawyersDTO = BuildingProjectLawyerDTO[];

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
  @property({type: 'string'})
  case_no: string;
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

  constructor(data?: Partial<BuildingProjectDTO>) {
    super(data);
  }

  static fromModel(data: BuildingProject): BuildingProjectDTO {
    return new BuildingProjectDTO({
      id: data.id,
      status: data.status,
      created_at: data.created.at,
      updated_at: data.updated.at,
      case_no: data.case_no.case_no,
      address: BuildingProjectLocationAddressDTO.fromModel(data.address),
      ownership_type: BuildingProjectOwnershipTypeDTO.fromModel(
        data.ownership_type,
      ),
      project_usage_description: data.project_usage_description,
      project_usage_types: data.project_usage_types,
      building_site_location: BuildingProjectBuildingSiteLocationDTO.fromModel(
        data.building_site_location,
      ),
      lawyers: data.lawyers?.map(BuildingProjectLawyerDTO.fromModel),
      ownership: BuildingProjectOwnershipDTO.fromModel(data.ownership),
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
