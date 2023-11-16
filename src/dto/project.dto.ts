/* eslint-disable @typescript-eslint/naming-convention */
import {AnyObject, Model, model, property} from '@loopback/repository';
import {IResult} from 'mssql';
import {ProjectSummaryItem} from '../services';

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
  city: string;
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
export class ProjectSummaryDTO extends Model {
  @property({type: 'string'})
  id: string;
  @property({type: 'string'})
  case_no: string;
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
