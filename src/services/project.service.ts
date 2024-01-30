/* eslint-disable @typescript-eslint/naming-convention */
import {BindingKey, BindingScope, inject, injectable} from '@loopback/core';
import {Filter} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {
  ProjectDetailsDTO,
  ProjectsSummaryDTO,
  ProjectSummaryDTO,
  WorkRefReadyDTO,
  WorkRefReadyListDTO,
} from '../dto';
import {MsSqlService} from './ms-sql.service';

export interface ProjectSummaryEngineer {
  engineer_type: string;
  personel_id: string;
  engineer_name: string;
  engineer_family: string;
  gender: string;
  shbillet: string;
}

export interface ProjectSummaryItem extends ProjectSummaryEngineer {
  id: string;
  case_no: string;
  owner_name: string;
  owner_father: string;
  owner_mobile: string;
  owner_shsh: string;
  total_units: number | null;
  total_area: number | null;
  total_floor: number | null;
  total_parking: number | null;
  total_anbari: number | null;
  usage_sanati: number | null;
  project_type: string;
}

export interface PlanControlProject {
  id: bigint;
  TrackCode: bigint | null;
  OfficeId: number | null;
  MainRecordZip: string | null;
  SecondryRecordZip: string | null;
  RecodZipPart: string | null;
  RecodZipSection: string | null;
  Address_State: number | null;
  city_id: number | null;
  Address_Municipal: number | null;
  Address_Zone: number | null;
  Address_Neighborhood: string | null;
  Address_Street: string | null;
  Address_Alley: string | null;
  Address_Zip: string | null;
  Address_PostalCode: bigint | null;
  Owner_Name: string | null;
  Owner_Father: string | null;
  Owner_shsh: string | null;
  Owner_RegisterPlace: string | null;
  Lawyer_Name: string | null;
  Lawyer_Father: string | null;
  Lawyer_shsh: string | null;
  Lawyer_RegisterPlace: string | null;
  OwnershipType: number | null;
  OwnershipTypeName: string | null;
  CaseNo: string | null;
  CaseDate: Date | null;
  MapCreateFormNo: string | null;
  MapCreateDate: Date | null;
  BuildingDensity: number | null;
  Useage_Maskooni: boolean | null;
  Useage_Edari: boolean | null;
  Useage_Tejari: boolean | null;
  Useage_Sanati: boolean | null;
  Useage_Damdari: boolean | null;
  Useage_Golkhane: boolean | null;
  Useage_Morghdari: boolean | null;
  Useage_TasisatShahri: boolean | null;
  Useage_Behdashti: boolean | null;
  Useage_Amoozeshi: boolean | null;
  Useage_Khadamati: boolean | null;
  Useage_Other: boolean | null;
  Useage_Other_Id: number | null;
  Useage_OtherTypeName: string | null;
  Area: number | null;
  ConstructionPlace: number | null;
  AllowedFloorConstruction: number | null;
  AllowedFloorConstructionType: number | null;
  DimentionRegisterdNorth: string | null;
  DimentionRegisterdEast: string | null;
  DimentionRegisterdSoth: string | null;
  DimentionRegisterdWest: string | null;
  DimentionRegusterdPekh: string | null;
  DimentionCurrNorth: string | null;
  DimentionCurrEast: string | null;
  DimentionCurrSouth: string | null;
  DimentionCurrWest: string | null;
  DimentionCurrPekh: string | null;
  DimentionRemainNorth: string | null;
  DimentionRemainEast: string | null;
  DimentionRemainSouth: string | null;
  DimentionRemainWest: string | null;
  DimentionRemainPekh: string | null;
  GozarEslahiNorth: string | null;
  GozarEslahiEast: string | null;
  GozarEslahiSouth: string | null;
  GozarEslahiWest: string | null;
  GozarEslahiRemainNorth: string | null;
  GozarEslahiRemainEast: string | null;
  GozarEslahiRemainSouth: string | null;
  GozarEslahiRemainWest: string | null;
  HarimGozar: number | null;
  BarVaKafDesc: string | null;
  BuildingLicenseNo: string | null;
  BuildingLicenseType: number | null;
  BuildingLicenseFileNo: string | null;
  BuildingLicenseDate: Date | null;
  RequestNo: string | null;
  RequestDate: Date | null;
  RequestPelakSabti: string | null;
  RequestBakhsh: string | null;
  ExtendStartDate: Date | null;
  ExtendDuration: number | null;
  TotalArea: number | null;
  TotalFloor: number | null;
  TotalUnits: number | null;
  EstehkamDegree: number | null;
  EstehkamMetraj: number | null;
  EstehkamDate: Date | null;
  BetooniFelezi: number | null;
  NosaziCode: string | null;
  Gharardad_Id: number | null;
  Joosh_Gharardad_Id: number | null;
  Milgerd_Gharardad_Id: number | null;
  Geo_Gharardad_Id: number | null;
  Bargh_Gharardad_Id: number | null;
  Poly_Gharardad_Id: number | null;
  HasLift: boolean | null;
  HasUnderground: boolean | null;
  Owner_Phone: string | null;
  OwnerMobile: string | null;
  OwnerCompany: string | null;
  HasPartner: boolean | null;
  PartnerName: string | null;
  InOldArea: boolean | null;
  HasPolystiren: boolean | null;
  TejariUnits: number | null;
  MaskooniUnits: number | null;
  AreaAfterRetreat: number | null;
  Malek_Nezarat: string | null;
  Malek_Naghshe: string | null;
  useage_id1: number | null;
  useage_id2: number | null;
  useage_id3: number | null;
  useage_id4: number | null;
  useage_id5: number | null;
  useage_id6: number | null;
  useage_id7: number | null;
  useage_id8: number | null;
  floor_id1: number | null;
  floor_id2: number | null;
  floor_id3: number | null;
  floor_id4: number | null;
  floor_id5: number | null;
  floor_id6: number | null;
  floor_id7: number | null;
  floor_id8: number | null;
  floor_id10: number | null;
  floor_id11: number | null;
  ProjectConfirmed: boolean | null;
  Project_Signed: boolean | null;
  ProjectSendToOrg: boolean | null;
  Mojri_Id: number | null;
  Mojri_Type: number | null;
  MunicipalDesc: string | null;
  TotalAreaStr: string | null;
  NavaghesNazariyeProject: string | null;
  RegisterDateForSign: Date | null;
  pc_Id: number | null;
  UnitLow100: number | null;
  UnitHigh200: number | null;
  UnitHigh100: number | null;
  dualNazer: number | null;
  Desc: string | null;
  RegisterNo: string | null;
  RegisterDate: Date | null;
  MunicipalHeader: string | null;
  MunicipalFooter: string | null;
  FinishNo: string | null;
  FinishDate: Date | null;
  FinishDesc: string | null;
  State: number | null;
  SahmieType: number | null;
  SahmieMetraj: number | null;
  SahmieDesc: string | null;
  TarkhisDate: Date | null;
  TarkhisName: string | null;
  OwnerAddress: string | null;
  AreaBeforeRetreat: number | null;
  FromNorth: string | null;
  FromEast: string | null;
  FromSouth: string | null;
  FromWest: string | null;
  CaseQueueDate: Date | null;
  ProxyNo: string | null;
  ProxyDate: Date | null;
  TechBookRecievedDate: Date | null;
  TechBookSerialNumber: string | null;
  TechBookIssueDate: Date | null;
  TechBookOwnerName: string | null;
  TechBookFloor: number | null;
  TechBookArea: number | null;
  TechBookUnit: number | null;
  TechBookDeliverDate: Date | null;
  FacadeBrick: boolean | null;
  FacadeStone: boolean | null;
  FacadeConcrete: boolean | null;
  FacadeGlass: boolean | null;
  FacadeAluminium: boolean | null;
  FacadeOther: string | null;
  RoofCoatTar: boolean | null;
  RoofCoatIsogam: boolean | null;
  RoofCoatMosaic: boolean | null;
  RoofCoatAsphalt: boolean | null;
  RoofCoatSteel: boolean | null;
  RoofCoatPottery: boolean | null;
  RoofCoatGalvanized: boolean | null;
  RoofCoatConcrete: boolean | null;
  RoofCoatOther: string | null;
  FloorAccessStair: boolean | null;
  FloorAccessEscalator: boolean | null;
  FloorAccessEsc: boolean | null;
  WinSteel: boolean | null;
  WinAluminium: boolean | null;
  WinPVC: boolean | null;
  WinWood: boolean | null;
  WinOther: string | null;
  FundationMonfared: boolean | null;
  FundationNavari: boolean | null;
  FundationGostarde: boolean | null;
  FundationDeep: boolean | null;
  FundationSemiDeep: boolean | null;
  FundationParticular: boolean | null;
  RoofTirche: boolean | null;
  RoofSlab: boolean | null;
  RoofMorakab: boolean | null;
  RoofReadyMade: boolean | null;
  RoofChromite: boolean | null;
  RoofComposite: boolean | null;
  RoofSteelDeck: boolean | null;
  RoofOther: string | null;
  HeatingCentral: boolean | null;
  HeatingPackage: boolean | null;
  HeatingChimney: boolean | null;
  HeatingFireplace: boolean | null;
  HeatingOthere: string | null;
  CoolingCentral: boolean | null;
  CoolingPackage: boolean | null;
  CoolingWCooler: boolean | null;
  CoolingAC: boolean | null;
  CoolingOther: string | null;
  SewageSeptic: boolean | null;
  SewageSewer: boolean | null;
  SewageChahjazbi: boolean | null;
  SewageOther: string | null;
  OthersCentralAnthena: boolean | null;
  OthersFireAlarm: boolean | null;
  BuildingImportance: number | null;
  TotalParking: number | null;
  TotalAnbari: number | null;
  ProjectType: number | null;
  ttl: number;
  extra: string | null;
  expired_sms_at: Date | null;
  created_at: Date;
  total_stop: number | null;
  is_complete_queue: boolean | null;
}

@injectable({scope: BindingScope.APPLICATION})
export class ProjectService {
  static BINDING_KEY = BindingKey.create<ProjectService>(
    `services.${ProjectService.name}`,
  );

  constructor(
    @inject(MsSqlService.BINDING_KEY) private sqlService: MsSqlService,
  ) {}

  private projectDetailsQueryByCaseNo = (caseNo: string): string => `
SELECT  *
FROM    PlanControl_Projects
WHERE   CaseNo = '${caseNo}'
`;

  private projectSummaryQueryByCaseNo = (caseNo: string): string => `
SELECT  pcp.*,
        ppe.EngType as engineer_type,
        ppe.personel_id as personel_id,
        p.name as engineer_name,
        p.family as engineer_family,
        p.sexuality as gender,
        p.shbillet as shbillet
FROM
       (
          select  id,
                  CaseNo as case_no,
                  Owner_Name as owner_name,
                  Owner_Father as owner_father,
                  OwnerMobile as owner_mobile,
                  Owner_shsh as owner_shsh,
                  TotalUnits as total_units,
                  TotalArea as total_area,
                  TotalFloor as total_floor,
                  TotalParking as total_parking,
                  TotalAnbari as total_anbari,
                  ProjectType as project_type,
                  Useage_Sanati as usage_sanati
          from    PlanControl_Projects
          where   CaseNo = '${caseNo}'
       ) as pcp
     left join PlanControl_ProjectEngineers as ppe   on (ppe.Project_Id = pcp.id and ppe.[State] <> -1)
     left join personnel as p                        on p.id = ppe.Personel_Id
`;

  private projectsSummaryQuery = (
    skip: number = 0,
    limit: number = 100,
  ): string => `
SELECT  pcp.*,
        ppe.EngType as engineer_type,
        ppe.personel_id as personel_id,
        p.name as engineer_name,
        p.family as engineer_family,
        p.sexuality as gender,
        p.shbillet as shbillet
FROM
       (
          select  id,
                  CaseNo as case_no,
                  Owner_Name as owner_name,
                  Owner_Father as owner_father,
                  OwnerMobile as owner_mobile,
                  Owner_shsh as owner_shsh,
                  TotalUnits as total_units,
                  TotalArea as total_area,
                  TotalFloor as total_floor,
                  TotalParking as total_parking,
                  TotalAnbari as total_anbari,
                  ProjectType as project_type,
                  Useage_Sanati as usage_sanati
          from    PlanControl_Projects
       ) as pcp
    left join PlanControl_ProjectEngineers as ppe   on ppe.Project_Id = pcp.id
    left join personnel as p                        on p.id = ppe.Personel_Id
ORDER BY ID DESC
OFFSET ${Math.max(skip, 0)} ROWS
FETCH NEXT ${Math.min(limit, 100)} ROWS ONLY
`;

  private workRefListQuery = (minTtl = 0) => `
	  SELECT
			p.[id] as id,
			p.[Owner_Name] as ownerName,
      p.[Owner_shsh] as ownerShsh,
			p.[OwnerMobile] as ownerMobile,
      p.[Address_Street] as addressStreet,
      p.[TotalArea] as totalArea,
      p.[TotalFloor] as totalFloor,
      p.[TotalUnits] as totalUnits,
      p.[Useage_Maskooni] as useageMaskooni,
      p.[Useage_Edari] as useageEdari,
      p.[Useage_Tejari] as useageTejari,
      p.[Useage_Sanati] as useageSanati,
      p.[Useage_Damdari] as useageDamdari,
      p.[Useage_Golkhane] as useageGolkhane,
      p.[Useage_Morghdari] as useageMorghdari,
      p.[Useage_TasisatShahri] as useageTasisatShahri,
      p.[Useage_Behdashti] as useageBehdashti,
      p.[Useage_Amoozeshi] as useageAmoozeshi,
      p.[Useage_Khadamati] as useageKhadamati,
      p.[Useage_Other] as useageOther,
      p.[OfficeId] as officeId,
      p.[BuildingDensity] as buildingDensity,
      p.[BetooniFelezi] as betooniFelezi,
      p.[NosaziCode] as nosaziCode,
      p.[Gharardad_Id] as gharardadId,
      p.[Joosh_Gharardad_Id] as jooshGharardadId,
      p.[Milgerd_Gharardad_Id] as milgerdGharardadId,
      p.[Geo_Gharardad_Id] as geoGharardadId,
      p.[Bargh_Gharardad_Id] as barghGharardadId,
      p.[Poly_Gharardad_Id] as polyGharardadId,
      p.[HasLift] as hasLift,
      p.[HasUnderground] as hasUnderground,
      p.[InOldArea] as inOldArea,
      p.[HasPolystiren] as hasPolystiren,
      p.[TejariUnits] as tejariUnits,
      p.[MaskooniUnits] as maskooniUnits,
      p.[AreaAfterRetreat] as areaAfterRetreat,
      p.[Malek_Nezarat] as malekNezarat,
      p.[Malek_Naghshe] as malekNaghshe,
      p.[Mojri_Id] as mojriId,
      p.[Mojri_Type] as mojriType,
      p.[MunicipalDesc] as municipalDesc,
      p.[NavaghesNazariyeProject] as navaghesNazariyeProject,
      p.[UnitLow100] as unitLow100,
      p.[UnitHigh100] as unitHigh100,
      p.[UnitHigh200] as unitHigh200,
      p.[dualNazer] as dualNazer,
      p.[TarkhisName] as tarkhisName,
      p.[OwnerAddress] as ownerAddress,
      p.[AreaBeforeRetreat] as areaBeforeRetreat,
      p.[FromNorth] as fromNorth,
      p.[FromEast] as fromEast,
      p.[FromSouth] as fromSouth,
      p.[FromWest] as fromWest,
      p.[FacadeBrick] as facadeBrick,
      p.[FacadeStone] as facadeStone,
      p.[FacadeConcrete] as facadeConcrete,
      p.[FacadeGlass] as facadeGlass,
      p.[FacadeAluminium] as facadeAluminium,
      p.[FacadeOther] as facadeOther,
      p.[RoofCoatTar] as roofCoatTar,
      p.[RoofCoatIsogam] as roofCoatIsogam,
      p.[RoofCoatMosaic] as roofCoatMosaic,
      p.[RoofCoatAsphalt] as roofCoatAsphalt,
      p.[RoofCoatSteel] as roofCoatSteel,
      p.[RoofCoatPottery] as roofCoatPottery,
      p.[RoofCoatGalvanized] as roofCoatGalvanized,
      p.[RoofCoatConcrete] as roofCoatConcrete,
      p.[RoofCoatOther] as roofCoatOther,
      p.[FloorAccessStair] as floorAccessStair,
      p.[FloorAccessEscalator] as floorAccessEscalator,
      p.[FloorAccessEsc] as floorAccessEsc,
      p.[WinSteel] as winSteel,
      p.[WinAluminium] as winAluminium,
      p.[WinPVC] as winPvc,
      p.[WinWood] as winWood,
      p.[WinOther] as winOther,
      p.[FundationMonfared] as fundationMonfared,
      p.[FundationNavari] as fundationNavari,
      p.[FundationGostarde] as fundationGostarde,
      p.[FundationDeep] as fundationDeep,
      p.[FundationSemiDeep] as fundationSemiDeep,
      p.[FundationParticular] as fundationParticular,
      p.[RoofTirche] as roofTirche,
      p.[RoofSlab] as roofSlab,
      p.[RoofMorakab] as roofMorakab,
      p.[RoofReadyMade] as roofReadyMade,
      p.[RoofChromite] as roofChromite,
      p.[RoofComposite] as roofComposite,
      p.[RoofSteelDeck] as roofSteelDeck,
      p.[RoofOther] as roofOther,
      p.[HeatingCentral] as heatingCentral,
      p.[HeatingPackage] as heatingPackage,
      p.[HeatingChimney] as heatingChimney,
      p.[HeatingFireplace] as heatingFireplace,
      p.[HeatingOthere] as heatingOthere,
      p.[CoolingCentral] as coolingCentral,
      p.[CoolingPackage] as coolingPackage,
      p.[CoolingWCooler] as coolingWCooler,
      p.[CoolingAC] as coolingAc,
      p.[CoolingOther] as coolingOther,
      p.[SewageSeptic] as sewageSeptic,
      p.[SewageSewer] as sewageSewer,
      p.[SewageChahjazbi] as sewageChahjazbi,
      p.[SewageOther] as sewageOther,
      p.[OthersCentralAnthena] as othersCentralAnthena,
      p.[OthersFireAlarm] as othersFireAlarm,
      p.[BuildingImportance] as buildingImportance,
      p.[TotalParking] as totalParking,
      p.[TotalAnbari] as totalAnbari,
      p.[ProjectType] as projectType,
      p.[Area] as area,
			c.[city] as city,
			c.[city_id] as cityId,
			p.[CaseNo] as caseNo,
			p.[CaseDate] as caseDate,
			p.[SahmieMetraj] as sahmieMetrage,
			p.[ttl] as ttl
    FROM
      [wref].[viw_projects_list] AS p
      INNER JOIN [nezam].[dbo].[cities] AS c On p.city_id=c.city_id
    WHERE
      (p.ttl > ${minTtl})
      `;

  async getProjectDetailsByCaseNo(caseNo: string): Promise<ProjectDetailsDTO> {
    const result = await this.sqlService.runQueryWithResult<PlanControlProject>(
      this.projectDetailsQueryByCaseNo(caseNo),
    );
    if (!result.recordset[0]) {
      throw new HttpErrors.UnprocessableEntity('Invalid case_no value');
    }
    return ProjectDetailsDTO.fromData(result);
  }

  async getProjectSummaryByCaseNo(caseNo: string): Promise<ProjectSummaryDTO> {
    const result = await this.sqlService.runQueryWithResult<ProjectSummaryItem>(
      this.projectSummaryQueryByCaseNo(caseNo),
    );
    if (!result.recordset[0]) {
      throw new HttpErrors.UnprocessableEntity('Invalid case_no value');
    }
    return ProjectSummaryDTO.fromData(result);
  }

  async getProjectSummary(
    filter?: Filter<ProjectSummaryDTO>,
  ): Promise<ProjectsSummaryDTO> {
    const result = await this.sqlService.runQueryWithResult<ProjectSummaryItem>(
      this.projectsSummaryQuery(filter?.skip, filter?.limit),
    );
    return ProjectSummaryDTO.fromDataArray(result);
  }

  async readyForWorkRefList(): Promise<WorkRefReadyListDTO> {
    const result = await this.sqlService.runQueryWithResult<WorkRefReadyDTO>(
      this.workRefListQuery(0),
    );
    return WorkRefReadyDTO.fromDataArray(result);
  }
}
