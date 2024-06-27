/* eslint-disable @typescript-eslint/naming-convention */
import {AnyObject, Model, model, property} from '@loopback/repository';
import {IResult} from 'mssql';
import {PlanControlProject, ProjectSummaryItem} from '../services';

@model()
export class WorkRefReadyDTO extends Model {
  @property({tyep: 'number'})
  id: number;
  @property({tyep: 'string'})
  ownerName: string;
  @property({tyep: 'string'})
  ownerShsh: string;
  @property({tyep: 'string'})
  ownerMobile: string;
  @property({tyep: 'string'})
  city?: string | null;
  @property({tyep: 'number'})
  cityId: number;
  @property({tyep: 'string'})
  caseNo: string;
  @property({tyep: 'date'})
  caseDate: Date;
  @property({tyep: 'number'})
  sahmieMetraj: number;
  @property({tyep: 'number'})
  ttl: number;
  @property({tyep: 'string'})
  extra: string;
  @property({tyep: 'string'})
  addressStreet: string;
  @property({tyep: 'string'})
  totalArea: string;
  @property({tyep: 'string'})
  totalFloor: string;
  @property({tyep: 'boolean'})
  useageMaskooni: boolean;
  @property({tyep: 'boolean'})
  useageEdari: boolean;
  @property({tyep: 'boolean'})
  useageTejari: boolean;
  @property({tyep: 'boolean'})
  useageSanati: boolean;
  @property({tyep: 'boolean'})
  useageDamdari: boolean;
  @property({tyep: 'boolean'})
  useageGolkhane: boolean;
  @property({tyep: 'boolean'})
  useageMorghdari: boolean;
  @property({tyep: 'boolean'})
  useageTasisatShahri: boolean;
  @property({tyep: 'boolean'})
  useageBehdashti: boolean;
  @property({tyep: 'boolean'})
  useageAmoozeshi: boolean;
  @property({tyep: 'boolean'})
  useageKhadamati: boolean;
  @property({tyep: 'boolean'})
  useageOther: boolean;
  @property({tyep: 'number'})
  officeId: number;
  @property({tyep: 'number'})
  buildingDensity: number;
  @property({tyep: 'number'})
  betooniFelezi: number;
  @property({tyep: 'string'})
  nosaziCode: string;
  @property({tyep: 'string'})
  gharardadId: string;
  @property({tyep: 'string'})
  jooshGharardadId: string;
  @property({tyep: 'string'})
  milgerdGharardadId: string;
  @property({tyep: 'string'})
  geoGharardadId: string;
  @property({tyep: 'string'})
  barghGharardadId: string;
  @property({tyep: 'string'})
  polyGharardadId: string;
  @property({tyep: 'boolean'})
  hasLift: boolean;
  @property({tyep: 'boolean'})
  hasUnderground: boolean;
  @property({tyep: 'boolean'})
  inOldArea: boolean;
  @property({tyep: 'boolean'})
  hasPolystiren: boolean;
  @property({tyep: 'number'})
  tejariUnits: number;
  @property({tyep: 'number'})
  maskooniUnits: number;
  @property({tyep: 'number'})
  areaAfterRetreat: number;
  @property({tyep: 'string'})
  malekNezarat: string;
  @property({tyep: 'string'})
  malekNaghshe: string;
  @property({tyep: 'number'})
  mojriId: number;
  @property({tyep: 'number'})
  mojriType: number;
  @property({tyep: 'string'})
  municipalDesc: string;
  @property({tyep: 'string'})
  navaghesNazariyeProject: string;
  @property({tyep: 'number'})
  unitLow100: number;
  @property({tyep: 'number'})
  unitHigh100: number;
  @property({tyep: 'number'})
  unitHigh200: number;
  @property({tyep: 'boolean'})
  dualNazer: boolean;
  @property({tyep: 'string'})
  tarkhisName: string;
  @property({tyep: 'string'})
  ownerAddress: string;
  @property({tyep: 'number'})
  areaBeforeRetreat: number;
  @property({tyep: 'number'})
  fromNorth: number;
  @property({tyep: 'number'})
  fromEast: number;
  @property({tyep: 'number'})
  fromSouth: number;
  @property({tyep: 'number'})
  fromWest: number;
  @property({tyep: 'boolean'})
  facadeBrick: boolean;
  @property({tyep: 'boolean'})
  facadeStone: boolean;
  @property({tyep: 'boolean'})
  facadeConcrete: boolean;
  @property({tyep: 'boolean'})
  facadeGlass: boolean;
  @property({tyep: 'boolean'})
  facadeAluminium: boolean;
  @property({tyep: 'boolean'})
  facadeOther: boolean;
  @property({tyep: 'boolean'})
  roofCoatTar: boolean;
  @property({tyep: 'boolean'})
  roofCoatIsogam: boolean;
  @property({tyep: 'boolean'})
  roofCoatMosaic: boolean;
  @property({tyep: 'boolean'})
  roofCoatAsphalt: boolean;
  @property({tyep: 'boolean'})
  roofCoatSteel: boolean;
  @property({tyep: 'boolean'})
  roofCoatPottery: boolean;
  @property({tyep: 'boolean'})
  roofCoatGalvanized: boolean;
  @property({tyep: 'boolean'})
  roofCoatConcrete: boolean;
  @property({tyep: 'boolean'})
  roofCoatOther: boolean;
  @property({tyep: 'boolean'})
  floorAccessStair: boolean;
  @property({tyep: 'boolean'})
  floorAccessEscalator: boolean;
  @property({tyep: 'boolean'})
  floorAccessEsc: boolean;
  @property({tyep: 'boolean'})
  winSteel: boolean;
  @property({tyep: 'boolean'})
  winAluminium: boolean;
  @property({tyep: 'boolean'})
  winPvc: boolean;
  @property({tyep: 'boolean'})
  winWood: boolean;
  @property({tyep: 'boolean'})
  winOther: boolean;
  @property({tyep: 'boolean'})
  fundationMonfared: boolean;
  @property({tyep: 'boolean'})
  fundationNavari: boolean;
  @property({tyep: 'boolean'})
  fundationGostarde: boolean;
  @property({tyep: 'boolean'})
  fundationDeep: boolean;
  @property({tyep: 'boolean'})
  fundationSemiDeep: boolean;
  @property({tyep: 'boolean'})
  fundationParticular: boolean;
  @property({tyep: 'boolean'})
  roofTirche: boolean;
  @property({tyep: 'boolean'})
  roofSlab: boolean;
  @property({tyep: 'boolean'})
  roofMorakab: boolean;
  @property({tyep: 'boolean'})
  roofReadyMade: boolean;
  @property({tyep: 'boolean'})
  roofChromite: boolean;
  @property({tyep: 'boolean'})
  roofComposite: boolean;
  @property({tyep: 'boolean'})
  roofSteelDeck: boolean;
  @property({tyep: 'string'})
  roofOther: string;
  @property({tyep: 'boolean'})
  heatingCentral: boolean;
  @property({tyep: 'boolean'})
  heatingPackage: boolean;
  @property({tyep: 'boolean'})
  heatingChimney: boolean;
  @property({tyep: 'boolean'})
  heatingFireplace: boolean;
  @property({tyep: 'boolean'})
  heatingOthere: boolean;
  @property({tyep: 'boolean'})
  coolingCentral: boolean;
  @property({tyep: 'boolean'})
  coolingPackage: boolean;
  @property({tyep: 'boolean'})
  coolingWCooler: boolean;
  @property({tyep: 'boolean'})
  coolingAc: boolean;
  @property({tyep: 'boolean'})
  coolingOther: boolean;
  @property({tyep: 'boolean'})
  sewageSeptic: boolean;
  @property({tyep: 'boolean'})
  sewageSewer: boolean;
  @property({tyep: 'boolean'})
  sewageChahjazbi: boolean;
  @property({tyep: 'boolean'})
  sewageOther: boolean;
  @property({tyep: 'boolean'})
  othersCentralAnthena: boolean;
  @property({tyep: 'boolean'})
  othersFireAlarm: boolean;
  @property({tyep: 'number'})
  buildingImportance: number;
  @property({tyep: 'number'})
  totalParking: number;
  @property({tyep: 'number'})
  totalAnbari: number;
  @property({tyep: 'number'})
  projectType: number;
  @property({tyep: 'number'})
  area: number;

  constructor(data?: Partial<WorkRefReadyDTO>) {
    super(data);
  }

  static fromModel(data: AnyObject): WorkRefReadyDTO {
    return new WorkRefReadyDTO(data);
  }

  static fromDataArray(data: IResult<WorkRefReadyDTO>): WorkRefReadyListDTO {
    return data.recordset.map(row => new WorkRefReadyDTO(row));
  }
}
export type WorkRefReadyListDTO = WorkRefReadyDTO[];

@model()
export class ProjectSummaryEngineerDTO extends Model {
  @property({type: 'string'})
  eng_type: string;
  @property({type: 'string'})
  personal_id: string;
  @property({type: 'string'})
  first_name: string;
  @property({type: 'string'})
  last_name: string;
  @property({type: 'string'})
  gender: string;
  @property({type: 'string'})
  shbillet: string;

  constructor(data?: Partial<ProjectSummaryEngineerDTO>) {
    super(data);
  }
}
export type ProjectSummaryEngineersDTO = ProjectSummaryEngineerDTO[];

@model()
export class ProjectDetailsDTO extends Model {
  @property({type: 'number', required: false})
  id: bigint;
  @property({type: 'number', required: false})
  TrackCode: bigint | null;
  @property({type: 'number', required: false})
  OfficeId: number | null;
  @property({type: 'string', required: false})
  MainRecordZip: string | null;
  @property({type: 'string', required: false})
  SecondryRecordZip: string | null;
  @property({type: 'string', required: false})
  RecodZipPart: string | null;
  @property({type: 'string', required: false})
  RecodZipSection: string | null;
  @property({type: 'number', required: false})
  Address_State: number | null;
  @property({tyep: 'string'})
  city?: string | null;
  @property({type: 'number', required: false})
  city_id: number | null;
  @property({type: 'number', required: false})
  Address_Municipal: number | null;
  @property({type: 'number', required: false})
  Address_Zone: number | null;
  @property({type: 'string', required: false})
  Address_Neighborhood: string | null;
  @property({type: 'string', required: false})
  Address_Street: string | null;
  @property({type: 'string', required: false})
  Address_Alley: string | null;
  @property({type: 'string', required: false})
  Address_Zip: string | null;
  @property({type: 'number', required: false})
  Address_PostalCode: bigint | null;
  @property({type: 'string', required: false})
  Owner_Name: string | null;
  @property({type: 'string', required: false})
  Owner_Father: string | null;
  @property({type: 'string', required: false})
  Owner_shsh: string | null;
  @property({type: 'string', required: false})
  Owner_RegisterPlace: string | null;
  @property({type: 'string', required: false})
  Lawyer_Name: string | null;
  @property({type: 'string', required: false})
  Lawyer_Father: string | null;
  @property({type: 'string', required: false})
  Lawyer_shsh: string | null;
  @property({type: 'string', required: false})
  Lawyer_RegisterPlace: string | null;
  @property({type: 'number', required: false})
  OwnershipType: number | null;
  @property({type: 'string', required: false})
  OwnershipTypeName: string | null;
  @property({type: 'string', required: false})
  CaseNo: string | null;
  @property({type: 'date', required: false})
  CaseDate: Date | null;
  @property({type: 'string', required: false})
  MapCreateFormNo: string | null;
  @property({type: 'date', required: false})
  MapCreateDate: Date | null;
  @property({type: 'number', required: false})
  BuildingDensity: number | null;
  @property({type: 'boolean', required: false})
  Useage_Maskooni: boolean | null;
  @property({type: 'boolean', required: false})
  Useage_Edari: boolean | null;
  @property({type: 'boolean', required: false})
  Useage_Tejari: boolean | null;
  @property({type: 'boolean', required: false})
  Useage_Sanati: boolean | null;
  @property({type: 'boolean', required: false})
  Useage_Damdari: boolean | null;
  @property({type: 'boolean', required: false})
  Useage_Golkhane: boolean | null;
  @property({type: 'boolean', required: false})
  Useage_Morghdari: boolean | null;
  @property({type: 'boolean', required: false})
  Useage_TasisatShahri: boolean | null;
  @property({type: 'boolean', required: false})
  Useage_Behdashti: boolean | null;
  @property({type: 'boolean', required: false})
  Useage_Amoozeshi: boolean | null;
  @property({type: 'boolean', required: false})
  Useage_Khadamati: boolean | null;
  @property({type: 'boolean', required: false})
  Useage_Other: boolean | null;
  @property({type: 'number', required: false})
  Useage_Other_Id: number | null;
  @property({type: 'string', required: false})
  Useage_OtherTypeName: string | null;
  @property({type: 'number', required: false})
  Area: number | null;
  @property({type: 'number', required: false})
  ConstructionPlace: number | null;
  @property({type: 'number', required: false})
  AllowedFloorConstruction: number | null;
  @property({type: 'number', required: false})
  AllowedFloorConstructionType: number | null;
  @property({type: 'string', required: false})
  DimentionRegisterdNorth: string | null;
  @property({type: 'string', required: false})
  DimentionRegisterdEast: string | null;
  @property({type: 'string', required: false})
  DimentionRegisterdSoth: string | null;
  @property({type: 'string', required: false})
  DimentionRegisterdWest: string | null;
  @property({type: 'string', required: false})
  DimentionRegusterdPekh: string | null;
  @property({type: 'string', required: false})
  DimentionCurrNorth: string | null;
  @property({type: 'string', required: false})
  DimentionCurrEast: string | null;
  @property({type: 'string', required: false})
  DimentionCurrSouth: string | null;
  @property({type: 'string', required: false})
  DimentionCurrWest: string | null;
  @property({type: 'string', required: false})
  DimentionCurrPekh: string | null;
  @property({type: 'string', required: false})
  DimentionRemainNorth: string | null;
  @property({type: 'string', required: false})
  DimentionRemainEast: string | null;
  @property({type: 'string', required: false})
  DimentionRemainSouth: string | null;
  @property({type: 'string', required: false})
  DimentionRemainWest: string | null;
  @property({type: 'string', required: false})
  DimentionRemainPekh: string | null;
  @property({type: 'string', required: false})
  GozarEslahiNorth: string | null;
  @property({type: 'string', required: false})
  GozarEslahiEast: string | null;
  @property({type: 'string', required: false})
  GozarEslahiSouth: string | null;
  @property({type: 'string', required: false})
  GozarEslahiWest: string | null;
  @property({type: 'string', required: false})
  GozarEslahiRemainNorth: string | null;
  @property({type: 'string', required: false})
  GozarEslahiRemainEast: string | null;
  @property({type: 'string', required: false})
  GozarEslahiRemainSouth: string | null;
  @property({type: 'string', required: false})
  GozarEslahiRemainWest: string | null;
  @property({type: 'number', required: false})
  HarimGozar: number | null;
  @property({type: 'string', required: false})
  BarVaKafDesc: string | null;
  @property({type: 'string', required: false})
  BuildingLicenseNo: string | null;
  @property({type: 'number', required: false})
  BuildingLicenseType: number | null;
  @property({type: 'string', required: false})
  BuildingLicenseFileNo: string | null;
  @property({type: 'date', required: false})
  BuildingLicenseDate: Date | null;
  @property({type: 'string', required: false})
  RequestNo: string | null;
  @property({type: 'date', required: false})
  RequestDate: Date | null;
  @property({type: 'string', required: false})
  RequestPelakSabti: string | null;
  @property({type: 'string', required: false})
  RequestBakhsh: string | null;
  @property({type: 'date', required: false})
  ExtendStartDate: Date | null;
  @property({type: 'number', required: false})
  ExtendDuration: number | null;
  @property({type: 'number', required: false})
  TotalArea: number | null;
  @property({type: 'number', required: false})
  TotalFloor: number | null;
  @property({type: 'number', required: false})
  TotalUnits: number | null;
  @property({type: 'number', required: false})
  EstehkamDegree: number | null;
  @property({type: 'number', required: false})
  EstehkamMetraj: number | null;
  @property({type: 'date', required: false})
  EstehkamDate: Date | null;
  @property({type: 'number', required: false})
  BetooniFelezi: number | null;
  @property({type: 'string', required: false})
  NosaziCode: string | null;
  @property({type: 'number', required: false})
  Gharardad_Id: number | null;
  @property({type: 'number', required: false})
  Joosh_Gharardad_Id: number | null;
  @property({type: 'number', required: false})
  Milgerd_Gharardad_Id: number | null;
  @property({type: 'number', required: false})
  Geo_Gharardad_Id: number | null;
  @property({type: 'number', required: false})
  Bargh_Gharardad_Id: number | null;
  @property({type: 'number', required: false})
  Poly_Gharardad_Id: number | null;
  @property({type: 'boolean', required: false})
  HasLift: boolean | null;
  @property({type: 'boolean', required: false})
  HasUnderground: boolean | null;
  @property({type: 'string', required: false})
  Owner_Phone: string | null;
  @property({type: 'string', required: false})
  OwnerMobile: string | null;
  @property({type: 'string', required: false})
  OwnerCompany: string | null;
  @property({type: 'boolean', required: false})
  HasPartner: boolean | null;
  @property({type: 'string', required: false})
  PartnerName: string | null;
  @property({type: 'boolean', required: false})
  InOldArea: boolean | null;
  @property({type: 'boolean', required: false})
  HasPolystiren: boolean | null;
  @property({type: 'number', required: false})
  TejariUnits: number | null;
  @property({type: 'number', required: false})
  MaskooniUnits: number | null;
  @property({type: 'number', required: false})
  AreaAfterRetreat: number | null;
  @property({type: 'string', required: false})
  Malek_Nezarat: string | null;
  @property({type: 'string', required: false})
  Malek_Naghshe: string | null;
  @property({type: 'number', required: false})
  useage_id1: number | null;
  @property({type: 'number', required: false})
  useage_id2: number | null;
  @property({type: 'number', required: false})
  useage_id3: number | null;
  @property({type: 'number', required: false})
  useage_id4: number | null;
  @property({type: 'number', required: false})
  useage_id5: number | null;
  @property({type: 'number', required: false})
  useage_id6: number | null;
  @property({type: 'number', required: false})
  useage_id7: number | null;
  @property({type: 'number', required: false})
  useage_id8: number | null;
  @property({type: 'number', required: false})
  floor_id1: number | null;
  @property({type: 'number', required: false})
  floor_id2: number | null;
  @property({type: 'number', required: false})
  floor_id3: number | null;
  @property({type: 'number', required: false})
  floor_id4: number | null;
  @property({type: 'number', required: false})
  floor_id5: number | null;
  @property({type: 'number', required: false})
  floor_id6: number | null;
  @property({type: 'number', required: false})
  floor_id7: number | null;
  @property({type: 'number', required: false})
  floor_id8: number | null;
  @property({type: 'number', required: false})
  floor_id10: number | null;
  @property({type: 'number', required: false})
  floor_id11: number | null;
  @property({type: 'boolean', required: false})
  ProjectConfirmed: boolean | null;
  @property({type: 'boolean', required: false})
  Project_Signed: boolean | null;
  @property({type: 'boolean', required: false})
  ProjectSendToOrg: boolean | null;
  @property({type: 'number', required: false})
  Mojri_Id: number | null;
  @property({type: 'number', required: false})
  Mojri_Type: number | null;
  @property({type: 'string', required: false})
  MunicipalDesc: string | null;
  @property({type: 'string', required: false})
  TotalAreaStr: string | null;
  @property({type: 'string', required: false})
  NavaghesNazariyeProject: string | null;
  @property({type: 'date', required: false})
  RegisterDateForSign: Date | null;
  @property({type: 'number', required: false})
  pc_Id: number | null;
  @property({type: 'number', required: false})
  UnitLow100: number | null;
  @property({type: 'number', required: false})
  UnitHigh200: number | null;
  @property({type: 'number', required: false})
  UnitHigh100: number | null;
  @property({type: 'number', required: false})
  dualNazer: number | null;
  @property({type: 'string', required: false})
  Desc: string | null;
  @property({type: 'string', required: false})
  RegisterNo: string | null;
  @property({type: 'date', required: false})
  RegisterDate: Date | null;
  @property({type: 'string', required: false})
  MunicipalHeader: string | null;
  @property({type: 'string', required: false})
  MunicipalFooter: string | null;
  @property({type: 'string', required: false})
  FinishNo: string | null;
  @property({type: 'date', required: false})
  FinishDate: Date | null;
  @property({type: 'string', required: false})
  FinishDesc: string | null;
  @property({type: 'number', required: false})
  State: number | null;
  @property({type: 'number', required: false})
  SahmieType: number | null;
  @property({type: 'number', required: false})
  SahmieMetraj: number | null;
  @property({type: 'string', required: false})
  SahmieDesc: string | null;
  @property({type: 'date', required: false})
  TarkhisDate: Date | null;
  @property({type: 'string', required: false})
  TarkhisName: string | null;
  @property({type: 'string', required: false})
  OwnerAddress: string | null;
  @property({type: 'number', required: false})
  AreaBeforeRetreat: number | null;
  @property({type: 'string', required: false})
  FromNorth: string | null;
  @property({type: 'string', required: false})
  FromEast: string | null;
  @property({type: 'string', required: false})
  FromSouth: string | null;
  @property({type: 'string', required: false})
  FromWest: string | null;
  @property({type: 'date', required: false})
  CaseQueueDate: Date | null;
  @property({type: 'string', required: false})
  ProxyNo: string | null;
  @property({type: 'date', required: false})
  ProxyDate: Date | null;
  @property({type: 'date', required: false})
  TechBookRecievedDate: Date | null;
  @property({type: 'string', required: false})
  TechBookSerialNumber: string | null;
  @property({type: 'date', required: false})
  TechBookIssueDate: Date | null;
  @property({type: 'string', required: false})
  TechBookOwnerName: string | null;
  @property({type: 'number', required: false})
  TechBookFloor: number | null;
  @property({type: 'number', required: false})
  TechBookArea: number | null;
  @property({type: 'number', required: false})
  TechBookUnit: number | null;
  @property({type: 'date', required: false})
  TechBookDeliverDate: Date | null;
  @property({type: 'boolean', required: false})
  FacadeBrick: boolean | null;
  @property({type: 'boolean', required: false})
  FacadeStone: boolean | null;
  @property({type: 'boolean', required: false})
  FacadeConcrete: boolean | null;
  @property({type: 'boolean', required: false})
  FacadeGlass: boolean | null;
  @property({type: 'boolean', required: false})
  FacadeAluminium: boolean | null;
  @property({type: 'string', required: false})
  FacadeOther: string | null;
  @property({type: 'boolean', required: false})
  RoofCoatTar: boolean | null;
  @property({type: 'boolean', required: false})
  RoofCoatIsogam: boolean | null;
  @property({type: 'boolean', required: false})
  RoofCoatMosaic: boolean | null;
  @property({type: 'boolean', required: false})
  RoofCoatAsphalt: boolean | null;
  @property({type: 'boolean', required: false})
  RoofCoatSteel: boolean | null;
  @property({type: 'boolean', required: false})
  RoofCoatPottery: boolean | null;
  @property({type: 'boolean', required: false})
  RoofCoatGalvanized: boolean | null;
  @property({type: 'boolean', required: false})
  RoofCoatConcrete: boolean | null;
  @property({type: 'string', required: false})
  RoofCoatOther: string | null;
  @property({type: 'boolean', required: false})
  FloorAccessStair: boolean | null;
  @property({type: 'boolean', required: false})
  FloorAccessEscalator: boolean | null;
  @property({type: 'boolean', required: false})
  FloorAccessEsc: boolean | null;
  @property({type: 'boolean', required: false})
  WinSteel: boolean | null;
  @property({type: 'boolean', required: false})
  WinAluminium: boolean | null;
  @property({type: 'boolean', required: false})
  WinPVC: boolean | null;
  @property({type: 'boolean', required: false})
  WinWood: boolean | null;
  @property({type: 'string', required: false})
  WinOther: string | null;
  @property({type: 'boolean', required: false})
  FundationMonfared: boolean | null;
  @property({type: 'boolean', required: false})
  FundationNavari: boolean | null;
  @property({type: 'boolean', required: false})
  FundationGostarde: boolean | null;
  @property({type: 'boolean', required: false})
  FundationDeep: boolean | null;
  @property({type: 'boolean', required: false})
  FundationSemiDeep: boolean | null;
  @property({type: 'boolean', required: false})
  FundationParticular: boolean | null;
  @property({type: 'boolean', required: false})
  RoofTirche: boolean | null;
  @property({type: 'boolean', required: false})
  RoofSlab: boolean | null;
  @property({type: 'boolean', required: false})
  RoofMorakab: boolean | null;
  @property({type: 'boolean', required: false})
  RoofReadyMade: boolean | null;
  @property({type: 'boolean', required: false})
  RoofChromite: boolean | null;
  @property({type: 'boolean', required: false})
  RoofComposite: boolean | null;
  @property({type: 'boolean', required: false})
  RoofSteelDeck: boolean | null;
  @property({type: 'string', required: false})
  RoofOther: string | null;
  @property({type: 'boolean', required: false})
  HeatingCentral: boolean | null;
  @property({type: 'boolean', required: false})
  HeatingPackage: boolean | null;
  @property({type: 'boolean', required: false})
  HeatingChimney: boolean | null;
  @property({type: 'boolean', required: false})
  HeatingFireplace: boolean | null;
  @property({type: 'string', required: false})
  HeatingOthere: string | null;
  @property({type: 'boolean', required: false})
  CoolingCentral: boolean | null;
  @property({type: 'boolean', required: false})
  CoolingPackage: boolean | null;
  @property({type: 'boolean', required: false})
  CoolingWCooler: boolean | null;
  @property({type: 'boolean', required: false})
  CoolingAC: boolean | null;
  @property({type: 'string', required: false})
  CoolingOther: string | null;
  @property({type: 'boolean', required: false})
  SewageSeptic: boolean | null;
  @property({type: 'boolean', required: false})
  SewageSewer: boolean | null;
  @property({type: 'boolean', required: false})
  SewageChahjazbi: boolean | null;
  @property({type: 'string', required: false})
  SewageOther: string | null;
  @property({type: 'boolean', required: false})
  OthersCentralAnthena: boolean | null;
  @property({type: 'boolean', required: false})
  OthersFireAlarm: boolean | null;
  @property({type: 'number', required: false})
  BuildingImportance: number | null;
  @property({type: 'number', required: false})
  TotalParking: number | null;
  @property({type: 'number', required: false})
  TotalAnbari: number | null;
  @property({type: 'number', required: false})
  ProjectType: number | null;
  @property({type: 'number', required: true})
  ttl: number;
  @property({type: 'string', required: false})
  extra: string | null;
  @property({type: 'date', required: false})
  expired_sms_at: Date | null;
  @property({type: 'date', required: true})
  created_at: Date;
  @property({type: 'number', required: false})
  total_stop: number | null;
  @property({type: 'boolean', required: false})
  is_complete_queue: boolean | null;

  constructor(data?: Partial<ProjectDetailsDTO>) {
    super(data);
  }

  static fromData(data: IResult<PlanControlProject>): ProjectDetailsDTO {
    const row = data.recordset[0];
    return new ProjectDetailsDTO(row);
  }
}

@model()
export class ProjectSummaryDTO extends Model {
  @property({type: 'string'})
  id: string;
  @property({type: 'string'})
  case_no: string;
  @property({type: 'string'})
  case_date: Date;
  @property({type: 'string'})
  owner_name: string;
  @property({type: 'string'})
  owner_father: string;
  @property({type: 'string'})
  owner_mobile: string;
  @property({type: 'string'})
  owner_cert_id: string;
  @property({type: 'number'})
  total_units: number | null;
  @property({type: 'number'})
  total_area: number | null;
  @property({type: 'number'})
  total_floor: number | null;
  @property({type: 'number'})
  total_parking: number | null;
  @property({type: 'number'})
  total_anbari: number | null;
  @property({type: 'string'})
  project_type: string;
  @property({type: 'number'})
  usage_sanati: number | null;

  @property.array(ProjectSummaryEngineerDTO, {})
  engineers: ProjectSummaryEngineersDTO;

  constructor(data?: Partial<ProjectSummaryDTO>) {
    super(data);
  }

  static fromData(data: IResult<ProjectSummaryItem>): ProjectSummaryDTO {
    const firstData = data.recordset[0];
    return new ProjectSummaryDTO({
      id: firstData.id,
      case_no: firstData.case_no,
      case_date: firstData.case_date,
      owner_name: firstData.owner_name,
      owner_father: firstData.owner_father,
      owner_cert_id: firstData.owner_shsh,
      owner_mobile: firstData.owner_mobile,
      total_units: firstData.total_units,
      total_area: firstData.total_area,
      total_floor: firstData.total_floor,
      total_anbari: firstData.total_anbari,
      total_parking: firstData.total_parking,
      project_type: firstData.project_type,
      usage_sanati: firstData.usage_sanati,
      engineers: data.recordset.map(
        item =>
          new ProjectSummaryEngineerDTO({
            eng_type: item.engineer_type,
            personal_id: item.personel_id,
            first_name: item.engineer_name,
            last_name: item.engineer_family,
            gender: item.gender,
            shbillet: item.shbillet,
          }),
      ),
    });
  }

  static fromDataArray(data: IResult<ProjectSummaryItem>): ProjectsSummaryDTO {
    return data.recordset.map(
      row =>
        new ProjectSummaryDTO({
          id: row.id,
          case_no: row.case_no,
          case_date: row.case_date,
          owner_name: row.owner_name,
          owner_father: row.owner_father,
          owner_cert_id: row.owner_shsh,
          owner_mobile: row.owner_mobile,
          total_units: row.total_units,
          total_area: row.total_area,
          total_floor: row.total_floor,
          total_anbari: row.total_anbari,
          total_parking: row.total_parking,
          project_type: row.project_type,
          usage_sanati: row.usage_sanati,
          engineers: data.recordset.map(
            item =>
              new ProjectSummaryEngineerDTO({
                eng_type: item.engineer_type,
                personal_id: item.personel_id,
                first_name: item.engineer_name,
                last_name: item.engineer_family,
                gender: item.gender,
                shbillet: item.shbillet,
              }),
          ),
        }),
    );
  }
}
export type ProjectsSummaryDTO = ProjectSummaryDTO[];
