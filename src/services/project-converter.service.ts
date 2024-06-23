/* eslint-disable @typescript-eslint/naming-convention */
import {BindingKey, BindingScope, inject, injectable} from '@loopback/core';
import {PlanControlProject} from './project.service';
import {HttpErrors} from '@loopback/rest';
import {MsSqlService} from './ms-sql.service';
import basedata from '../basedata.json';
import {ProfileService, ProfileServiceProvider} from './profile.service';
import {KeycloakAgentService} from '../lib-keycloak/src';
import {AuthService, AuthServiceProvider} from './auth.service';
import {AnyObject, repository} from '@loopback/repository';
import {BuildingProjectRepository} from '../repositories';
import {BuildingProject} from '../models';
import {NewBuildingProjectRequestDTO} from '../dto';

@injectable({scope: BindingScope.APPLICATION})
export class ProjectConverterService {
  static BINDING_KEY = BindingKey.create<ProjectConverterService>(
    `services.${ProjectConverterService.name}`,
  );

  delay(ms = 1000): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  constructor(
    @repository(BuildingProjectRepository)
    private buildingProjectRepo: BuildingProjectRepository,
    @inject(MsSqlService.BINDING_KEY) private sqlService: MsSqlService,
    @inject(ProfileServiceProvider.BINDING_KEY)
    private profileService: ProfileService,
    @inject(AuthServiceProvider.BINDING_KEY) private authService: AuthService,
    @inject(KeycloakAgentService.BINDING_KEY)
    private keycloakAgentService: KeycloakAgentService,
  ) {}

  private projectDetailsQueryByCaseNo = (caseNo: string): string => `
SELECT  p.*
FROM    PlanControl_Projects AS p
WHERE   CaseNo = '${caseNo}'
`;

  async importProject(
    userId: string,
    caseNo: string,
  ): Promise<BuildingProject> {
    const {
      recordset: [project],
    } = await this.sqlService.runQueryWithResult<PlanControlProject>(
      this.projectDetailsQueryByCaseNo(caseNo),
    );
    if (!project) {
      throw new HttpErrors.UnprocessableEntity('Invalid case_no value');
    }

    // convert project new-style
    const projectObject = await this.toProjectObject(project);
    const prjDto = new NewBuildingProjectRequestDTO({...projectObject});
    return this.buildingProjectRepo.create(prjDto.toModel(userId));
  }

  async createProfile(
    token: string,
    nId: string,
    data:
      | AnyObject
      | {
          firstName: string;
          lastName: string;
          mobile: string;
        },
  ): Promise<AnyObject> {
    // Create new user profile
    const body = {
      email: `${nId}@qeng.ir`,
      firstName: data.firstName,
      lastName: data.lastName,
      username: nId,
      password: nId,
      mobile: data.mobile,
      birthdate: new Date('2000-01-01T00:00:00.00Z'),
      mark_as_unconfirmed: true,
      meta: {
        tags: ['PROJECT_IMPORT'],
      },
    };
    await this.authService.createUser(token, body);
    await this.delay(1500);
    return this.profileService.userProfile(token, nId);
  }

  async getProfileOrCreate(
    nId: string,
    data: {firstName: string; lastName: string; mobile: string},
  ): Promise<AnyObject> {
    nId = nId.padStart(10, '0');

    // Get token
    const {access_token} = await this.keycloakAgentService.getAdminToken();

    // Get Profile
    const profile = await this.profileService.userProfile(access_token, nId);
    if (profile) {
      return profile;
    }

    // Create Profile
    return this.createProfile(access_token, nId, data);
  }

  async getOwner(data: AnyObject): Promise<AnyObject> {
    const [firstName, ...lastName] = data['Owner_Name'].split(' ');
    const profile = await this.getProfileOrCreate(data['Owner_shsh'], {
      firstName: firstName ?? '-',
      lastName: (lastName ?? []).join(' '),
      mobile: data['OwnerMobile'],
    });
    return {
      user_id: profile.user_id,
      address: data.OwnerAddress ?? '',
      is_delegate: true,
    };
  }

  async getLawyer(data: AnyObject): Promise<AnyObject | undefined> {
    if (!data.Lawyer_Name) {
      return undefined;
    }
    const [firstName, ...lastName] = (data.Lawyer_Name ?? '').split(' ');
    const profile = await this.getProfileOrCreate(data['Lawyer_shsh'], {
      firstName: firstName ?? '-',
      lastName: (lastName ?? []).join(' '),
      mobile: data['OwnerMobile'],
    });
    return {
      user_id: profile.user_id,
      power_of_attorney_date: data.ProxyDate ?? undefined,
      power_of_attorney_number: data.ProxyNo ?? undefined,
      description: undefined,
    };
  }

  async toProjectObject(data: AnyObject): Promise<AnyObject> {
    const owner = await this.getOwner(data);
    const lawyer = await this.getLawyer(data);

    return {
      case_no: data.CaseNo,
      address: {
        property_registration_details: {
          main: data.MainRecordZip,
          sub: data.SecondryRecordZip,
          sector: data.RecodZipSection,
          part: data.RecodZipPart,
        },
        long: 0,
        lat: 0,
        city_id:
          basedata.cities[data.Address_State as keyof typeof basedata.cities] ??
          '',
        municipality_district_id:
          basedata.states[
            data.Address_Municipal as keyof typeof basedata.states
          ] ?? '',
        area: 0,
        street: data.Address_Street,
        alley: data.Address_Alley ?? undefined,
        plaque: data.Address_Zip ?? undefined,
        zip_code: data.Address_PostalCode ?? undefined,
      },
      ownership_type: {
        ownership_type_id:
          basedata.addressOwnership[
            data.OwnershipType as keyof typeof basedata.addressOwnership
          ],
        description: undefined,
        form_number: data.MapCreateFormNo,
        issue_date: data.MapCreateDate ?? undefined,
        renewal_code: data.NosaziCode,
        building_density: data.BuildingDensity,
      },
      project_usage_types: basedata.building_usages
        .filter(x => data[x.field] === true)
        .map(x => x.id),
      project_usage_description: data.Useage_OtherTypeName ?? '',
      building_site_location: {
        location:
          basedata.placeBuildingTypes[
            data.ConstructionPlace as keyof typeof basedata.placeBuildingTypes
          ],
        land_occupancy: data.Area,
      },
      owners: [owner],
      owners_has_partners: data.HasPartner,
      lawyer: lawyer,
      specification: {
        descriptions: {
          roof_other: data.RoofOther,
          facade_other: data.FacadeOther,
          root_cover_other: data.RoofCoatOther,
          win_other: data.WinOther,
          heating_other: data.HeatingOthere,
          cooling_other: data.CoolingOther,
          sewage_other: data.SewageOther,
          quota_desc: data.SahmieDesc,
        },
        meta: {
          units_lt_100m: data.UnitLow100 ?? 0,
          units_btw_100_to_200m: data.UnitHigh100 ?? 0,
          units_gt_200m: data.UnitHigh200 ?? 0,
        },
        ground_area_before: data.AreaBeforeRetreat ?? 0,
        ground_area_after: data.AreaAfterRetreat ?? 0,
        total_area: data.TotalArea ?? 0,
        elevator_stops: data.total_stop ?? 0, /// check this
        total_floors: data.TotalFloor ?? 0,
        commercial_units: data.TejariUnits ?? 0,
        residental_units: data.MaskooniUnits ?? 0,
        total_units: data.TotalUnits ?? 0,
        parking_count: data.TotalParking ?? 0,
        house_storage_count: data.TotalAnbari ?? 0,
        distict_north: +(data.FromNorth ?? '0'),
        distict_south: +(data.FromSouth ?? '0'),
        distict_east: +(data.FromEast ?? '0'),
        distict_west: +(data.FromWest ?? '0'),
        building_priority:
          basedata.building_priority[
            data.BuildingImportance as keyof typeof basedata.building_priority
          ],
        building_type_id:
          basedata.building_type[
            data.BetooniFelezi as keyof typeof basedata.building_type
          ],
        foundation_types: basedata.foundations
          .filter(x => data[x.field] === true)
          .map(x => x.id),
        root_types: basedata.roof_types
          .filter(x => data[x.field] === true)
          .map(x => x.id),
        floor_access_systems: basedata.floor_access_types
          .filter(x => data[x.field] === true)
          .map(x => x.id),
        building_frontages: basedata.facade_type
          .filter(x => data[x.field] === true)
          .map(x => x.id),
        roof_cover_types: basedata.root_coat_types
          .filter(x => data[x.field] === true)
          .map(x => x.id),
        window_types: basedata.window_types
          .filter(x => data[x.field] === true)
          .map(x => x.id),
        cooling_system_types: basedata.cooling_types
          .filter(x => data[x.field] === true)
          .map(x => x.id),
        heating_system_types: basedata.heating_types
          .filter(x => data[x.field] === true)
          .map(x => x.id),
        sewage_disposals: basedata.sewate_types
          .filter(x => data[x.field] === true)
          .map(x => x.id),
        earth_connection_types: basedata.eath_connection_types
          .filter(x => data[x.field] === true)
          .map(x => x.id),

        polystyrene: data.HasPolystiren ?? false,
        underground: data.HasUnderground ?? false,
        dilapidated: data.InOldArea ?? false,
        two_supervisors: data.dualNazer === 1,
        incremental_project: data.incremental ?? false,
        quota_type_id:
          basedata.quota_types[
            data.SahmieType as keyof typeof basedata.quota_types
          ],
        quota_value: data.SahmieMetraj ?? undefined,
      },
    };
  }
}
