/* eslint-disable @typescript-eslint/naming-convention */
import {Model, model, property} from '@loopback/repository';
import {
  EnumBuildingSiteLocation,
  EnumBuildingSiteLocationValues,
  EnumProjectLocationType,
  EnumProjectLocationTypeValues,
  Project,
  ProjectBuildingSiteLocation,
  ProjectLawyer,
  ProjectLocationAddress,
  ProjectOwner,
  ProjectOwnership,
  ProjectOwnershipType,
  ProjectPropertyRegistrationDetails,
  ProjectSpecification,
} from '../models';
import {ModifyStamp} from '../lib-models/src';

@model({})
export class NewProjectSpecificationDTO extends Model {
  // Keep all descriptions for all fields
  @property({type: 'object', items: 'string', required: true})
  descriptions: Record<string, string>;

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
  building_priority: number;
  @property({type: 'string', required: true})
  building_type_id: string;
  @property({type: 'string', required: true})
  foundation_type_id: string;
  @property({type: 'string', required: true})
  root_type_id: string;
  @property({type: 'string', required: true})
  floor_access_system: string;
  @property({type: 'string', required: true})
  building_frontage: string;
  @property({type: 'string', required: true})
  roof_cover_type_id: string;
  @property({type: 'string', required: true})
  window_type_id: string;
  @property({type: 'string', required: true})
  cooling_system_type_id: string;
  @property({type: 'string', required: true})
  heating_system_type_id: string;
  @property({type: 'string', required: true})
  sewage_disposal_id: string;
  @property({type: 'string', required: true})
  earth_connection_type_id: string;

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
  @property({type: 'string', required: true})
  quota_type_id: string;

  constructor(data?: Partial<NewProjectSpecificationDTO>) {
    super(data);
  }

  toModel(): ProjectSpecification {
    return new ProjectSpecification({
      descriptions: this.descriptions,
      ground_area_before: this.ground_area_before,
      ground_area_after: this.ground_area_after,
      total_area: this.total_area,
      elevator_stops: this.elevator_stops,
      total_floors: this.total_floors,
      commercial_units: this.commercial_units,
      residental_units: this.residental_units,
      total_units: this.total_units,
      parking_count: this.parking_count,
      house_storage_count: this.house_storage_count,
      distict_north: this.distict_north,
      distict_south: this.distict_south,
      distict_east: this.distict_east,
      distict_west: this.distict_west,
      building_priority: this.building_priority,
      building_type_id: this.building_type_id,
      foundation_type_id: this.foundation_type_id,
      root_type_id: this.root_type_id,
      floor_access_system: this.floor_access_system,
      building_frontage: this.building_frontage,
      roof_cover_type_id: this.roof_cover_type_id,
      window_type_id: this.window_type_id,
      cooling_system_type_id: this.cooling_system_type_id,
      heating_system_type_id: this.heating_system_type_id,
      sewage_disposal_id: this.sewage_disposal_id,
      earth_connection_type_id: this.earth_connection_type_id,
      polystyrene: this.polystyrene,
      underground: this.underground,
      dilapidated: this.dilapidated,
      two_supervisors: this.two_supervisors,
      incremental_project: this.incremental_project,
      quota_type_id: this.quota_type_id,
    });
  }
}

@model({})
export class NewProjectLawyerDTO extends Model {
  @property({type: 'string', required: true})
  user_id: string;
  @property({type: 'string', required: true})
  power_of_attorney_number: string;
  @property({type: 'date', required: true})
  power_of_attorney_date: Date;
  @property({type: 'string', required: false})
  description?: string;

  constructor(data?: Partial<NewProjectLawyerDTO>) {
    super(data);
  }

  toModel(): ProjectLawyer {
    return new ProjectLawyer({
      user_id: this.user_id,
      power_of_attorney_date: new Date(this.power_of_attorney_date),
      power_of_attorney_number: this.power_of_attorney_number,
      description: this.description,
    });
  }
}
export type ProjectLawyers = ProjectLawyer[];

@model({})
export class NewProjectOwnerDTO extends Model {
  @property({type: 'string', required: true})
  user_id: string;
  @property({type: 'string', required: true})
  address: string;
  @property({type: 'boolean', required: true})
  is_delegate: boolean;

  constructor(data?: Partial<NewProjectOwnerDTO>) {
    super(data);
  }

  toModel(userId: string): ProjectOwner {
    const now = new ModifyStamp({by: userId});
    return new ProjectOwner({
      user_id: this.user_id,
      address: this.address,
      is_delegate: this.is_delegate ?? false,
      created: now,
      updated: now,
    });
  }
}
export type NewProjectOwnersDTO = NewProjectOwnerDTO[];

@model({})
export class NewProjectPropertyRegistrationDetailsDTO extends Model {
  @property({type: 'number', required: true})
  main: number;
  @property({type: 'number', required: true})
  sub: number;
  @property({type: 'number', required: true})
  sector: number;
  @property({type: 'number', required: true})
  part: number;

  constructor(data?: Partial<NewProjectPropertyRegistrationDetailsDTO>) {
    super(data);
  }

  toModel(): ProjectPropertyRegistrationDetails {
    return new ProjectPropertyRegistrationDetails({
      main: this.main,
      sub: this.sub,
      sector: this.sector,
      part: this.part,
    });
  }
}

@model({})
export class NewProjectLocationAddressDTO extends Model {
  // Property registration details
  @property({required: true})
  property_registration_details: NewProjectPropertyRegistrationDetailsDTO;

  // Map geo data
  @property({type: 'number', required: false})
  long?: number;
  @property({type: 'number', required: false})
  lat?: number;

  // Location details
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

  // Additional data
  @property({
    type: 'number',
    required: true,
    jsonSchema: {enum: EnumProjectLocationTypeValues},
  })
  type: EnumProjectLocationType;

  constructor(data?: Partial<NewProjectLocationAddressDTO>) {
    super(data);
    this.property_registration_details =
      new NewProjectPropertyRegistrationDetailsDTO(
        this.property_registration_details,
      );
  }

  toModel(): ProjectLocationAddress {
    return new ProjectLocationAddress({
      city_id: this.city_id,
      municipality_district_id: this.municipality_district_id,
      street: this.street,
      alley: this.alley,
      plaque: this.plaque,
      zip_code: this.zip_code,
      type: this.type,
      property_registration_details:
        this.property_registration_details.toModel(),
      area: this.area,
      long: this.long,
      lat: this.lat,
    });
  }
}

@model({})
export class NewProjectOwnershipTypeDTO extends Model {
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

  constructor(data?: Partial<NewProjectOwnershipTypeDTO>) {
    super(data);
  }

  toModel(): ProjectOwnershipType {
    return new ProjectOwnershipType({
      ownership_type_id: this.ownership_type_id,
      description: this.description,
      form_number: this.form_number,
      issue_date: this.issue_date,
      renewal_code: this.renewal_code,
      building_density: this.building_density,
    });
  }
}

@model({})
export class NewProjectBuildingSiteLocationDTO extends Model {
  @property({
    type: 'number',
    required: true,
    jsonSchema: {enum: EnumBuildingSiteLocationValues},
  })
  location: EnumBuildingSiteLocation;
  @property({type: 'number', required: true})
  land_occupancy: number;

  constructor(data?: Partial<NewProjectBuildingSiteLocationDTO>) {
    super(data);
  }

  toModel(): ProjectBuildingSiteLocation {
    return new ProjectBuildingSiteLocation({
      land_occupancy: this.land_occupancy,
      location: this.location,
    });
  }
}

@model()
export class NewProjectRequestDTO extends Model {
  @property({required: true})
  address: NewProjectLocationAddressDTO;
  @property({required: true})
  ownership_type: NewProjectOwnershipTypeDTO;
  @property.array(String, {required: true})
  project_usage_types: string[];
  @property({type: 'string', required: false})
  project_usage_description?: string;
  @property({required: true})
  building_site_location: NewProjectBuildingSiteLocationDTO;

  @property.array(NewProjectOwnerDTO, {required: true})
  owners: NewProjectOwnersDTO;
  @property({required: true})
  specification: NewProjectSpecificationDTO;

  constructor(data?: Partial<NewProjectRequestDTO>) {
    super(data);

    // Conver simple object to instances of classes
    this.address = new NewProjectLocationAddressDTO(this.address);
    this.ownership_type = new NewProjectOwnershipTypeDTO(this.ownership_type);
    this.building_site_location = new NewProjectBuildingSiteLocationDTO(
      this.building_site_location,
    );
    this.owners = this.owners.map(x => new NewProjectOwnerDTO(x));
    this.specification = new NewProjectSpecificationDTO(this.specification);
  }

  toModel(userId: string): Project {
    const now = new ModifyStamp({by: userId});
    return new Project({
      created: now,
      updated: now,
      address: this.address.toModel(),
      ownership_type: this.ownership_type.toModel(),
      building_site_lcoation: this.building_site_location.toModel(),
      ownership: new ProjectOwnership({
        owners: this.owners.map(x => x.toModel(userId)),
      }),
      specification: this.specification.toModel(),
    });
  }
}
