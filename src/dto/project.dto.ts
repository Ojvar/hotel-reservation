/* eslint-disable @typescript-eslint/naming-convention */
import {Model, model, property} from '@loopback/repository';
import {
  BuildingProject,
  BuildingProjectBuildingSiteLocation,
  BuildingProjectLawyer,
  BuildingProjectLocationAddress,
  BuildingProjectOwner,
  BuildingProjectOwnership,
  BuildingProjectOwnershipType,
  BuildingProjectPropertyRegistrationDetails,
  BuildingProjectSpecification,
} from '../models';
import {ModifyStamp} from '../lib-models/src';

@model({})
export class NewBuildingProjectSpecificationDTO extends Model {
  // Keep all descriptions for all fields
  @property({type: 'object', items: 'string', required: true})
  descriptions: Record<string, string>;
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

  constructor(data?: Partial<NewBuildingProjectSpecificationDTO>) {
    super(data);
  }

  toModel(): BuildingProjectSpecification {
    return new BuildingProjectSpecification({
      descriptions: this.descriptions,
      meta: this.meta ?? {},
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
      foundation_types: this.foundation_types,
      root_types: this.root_types,
      floor_access_systems: this.floor_access_systems,
      building_frontages: this.building_frontages,
      roof_cover_types: this.roof_cover_types,
      window_types: this.window_types,
      cooling_system_types: this.cooling_system_types,
      heating_system_types: this.heating_system_types,
      sewage_disposals: this.sewage_disposals,
      earth_connection_types: this.earth_connection_types,
      polystyrene: this.polystyrene,
      underground: this.underground,
      dilapidated: this.dilapidated,
      two_supervisors: this.two_supervisors,
      incremental_project: this.incremental_project,
      quota_type_id: this.quota_type_id,
      quota_value: this.quota_value,
    });
  }
}

@model({})
export class BuildingNewProjectLawyerDTO extends Model {
  @property({type: 'string', required: true})
  user_id: string;
  @property({type: 'string', required: true})
  power_of_attorney_number: string;
  @property({type: 'date', required: true})
  power_of_attorney_date: Date;
  @property({type: 'string', required: false})
  description?: string;

  constructor(data?: Partial<BuildingNewProjectLawyerDTO>) {
    super(data);
  }

  toModel(): BuildingProjectLawyer {
    return new BuildingProjectLawyer({
      user_id: this.user_id,
      power_of_attorney_date: new Date(this.power_of_attorney_date),
      power_of_attorney_number: this.power_of_attorney_number,
      description: this.description,
    });
  }
}
export type NewBuildingProjectLawyersDTO = BuildingNewProjectLawyerDTO[];

@model({})
export class NewBuildingProjectOwnerDTO extends Model {
  @property({type: 'string', required: true})
  user_id: string;
  @property({type: 'string', required: true})
  address: string;
  @property({type: 'boolean', required: true})
  is_delegate: boolean;

  constructor(data?: Partial<NewBuildingProjectOwnerDTO>) {
    super(data);
  }

  toModel(userId: string): BuildingProjectOwner {
    const now = new ModifyStamp({by: userId});
    return new BuildingProjectOwner({
      user_id: this.user_id,
      address: this.address,
      is_delegate: this.is_delegate ?? false,
      created: now,
      updated: now,
    });
  }
}
export type NewBuildingProjectOwnersDTO = NewBuildingProjectOwnerDTO[];

@model({})
export class NewBuildingProjectPropRegDetailsDTO extends Model {
  @property({type: 'number', required: true})
  main: number;
  @property({type: 'number', required: true})
  sub: number;
  @property({type: 'number', required: true})
  sector: number;
  @property({type: 'number', required: true})
  part: number;

  constructor(data?: Partial<NewBuildingProjectPropRegDetailsDTO>) {
    super(data);
  }

  toModel(): BuildingProjectPropertyRegistrationDetails {
    return new BuildingProjectPropertyRegistrationDetails({
      main: this.main,
      sub: this.sub,
      sector: this.sector,
      part: this.part,
    });
  }
}

@model({})
export class NewBuildingProjectLocationAddressDTO extends Model {
  // Property registration details
  @property({required: true})
  property_registration_details: NewBuildingProjectPropRegDetailsDTO;

  // Map geo data
  @property({type: 'number', required: false})
  long?: number;
  @property({type: 'number', required: false})
  lat?: number;
  @property({type: 'object', required: false})
  geo_info?: object;

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
  // @property({ type: 'string', required: true })
  // type: string;

  constructor(data?: Partial<NewBuildingProjectLocationAddressDTO>) {
    super(data);
    this.property_registration_details =
      new NewBuildingProjectPropRegDetailsDTO(
        this.property_registration_details,
      );
  }

  toModel(): BuildingProjectLocationAddress {
    return new BuildingProjectLocationAddress({
      city_id: this.city_id,
      municipality_district_id: this.municipality_district_id,
      street: this.street,
      alley: this.alley,
      plaque: this.plaque,
      zip_code: this.zip_code,
      // type: this.type,
      property_registration_details:
        this.property_registration_details.toModel(),
      area: this.area,
      long: this.long,
      lat: this.lat,
      geo_info: this.geo_info,
    });
  }
}

@model({})
export class NewBuildingProjectOwnershipTypeDTO extends Model {
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

  constructor(data?: Partial<NewBuildingProjectOwnershipTypeDTO>) {
    super(data);
  }

  toModel(): BuildingProjectOwnershipType {
    return new BuildingProjectOwnershipType({
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
export class NewBuildingProjectSiteLocationDTO extends Model {
  @property({type: 'string', required: true})
  location: string;
  @property({type: 'number', required: true})
  land_occupancy: number;

  constructor(data?: Partial<NewBuildingProjectSiteLocationDTO>) {
    super(data);
  }

  toModel(): BuildingProjectBuildingSiteLocation {
    return new BuildingProjectBuildingSiteLocation({
      land_occupancy: this.land_occupancy,
      location: this.location,
    });
  }
}

@model()
export class NewBuildingProjectRequestDTO extends Model {
  @property({required: true})
  address: NewBuildingProjectLocationAddressDTO;
  @property({required: true})
  ownership_type: NewBuildingProjectOwnershipTypeDTO;
  @property.array(String, {required: true})
  project_usage_types: string[];
  @property({type: 'string', required: false})
  project_usage_description?: string;
  @property({required: true})
  building_site_location: NewBuildingProjectSiteLocationDTO;
  @property.array(NewBuildingProjectOwnerDTO, {required: true})
  owners: NewBuildingProjectOwnersDTO;
  @property({type: 'boolean', required: true})
  owners_has_partners: boolean;
  @property({required: false})
  lawyer?: BuildingNewProjectLawyerDTO;
  @property({required: true})
  specification: NewBuildingProjectSpecificationDTO;

  constructor(data?: Partial<NewBuildingProjectRequestDTO>) {
    super(data);

    // Conver simple object to instances of classes
    this.address = new NewBuildingProjectLocationAddressDTO(this.address);
    this.ownership_type = new NewBuildingProjectOwnershipTypeDTO(
      this.ownership_type,
    );
    this.building_site_location = new NewBuildingProjectSiteLocationDTO(
      this.building_site_location,
    );
    this.owners = this.owners.map(x => new NewBuildingProjectOwnerDTO(x));
    this.lawyer = this.lawyer
      ? new BuildingNewProjectLawyerDTO(this.lawyer)
      : undefined;
    this.specification = new NewBuildingProjectSpecificationDTO(
      this.specification,
    );
  }

  toModel(userId: string): BuildingProject {
    const now = new ModifyStamp({by: userId});
    return new BuildingProject({
      created: now,
      updated: now,
      project_usage_types: this.project_usage_types,
      project_usage_description: this.project_usage_description,

      address: this.address.toModel(),
      ownership_type: this.ownership_type.toModel(),
      building_site_lcoation: this.building_site_location.toModel(),
      ownership: new BuildingProjectOwnership({
        owners: this.owners.map(x => x.toModel(userId)),
        has_partners: this.owners_has_partners,
      }),
      lawyers: this.lawyer ? [this.lawyer?.toModel()] : [],
      specification: this.specification.toModel(),
    });
  }
}
