/* eslint-disable @typescript-eslint/naming-convention */
import {BindingKey, BindingScope, inject, injectable} from '@loopback/core';
import {Filter} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {
  ProjectSummaryDTO,
  ProjectsSummaryDTO,
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

@injectable({scope: BindingScope.APPLICATION})
export class ProjectService {
  static BINDING_KEY = BindingKey.create<ProjectService>(
    `services.${ProjectService.name}`,
  );

  constructor(
    @inject(MsSqlService.BINDING_KEY) private sqlService: MsSqlService,
  ) {}

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
