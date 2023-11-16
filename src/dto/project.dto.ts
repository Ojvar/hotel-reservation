/* eslint-disable @typescript-eslint/naming-convention */
import {AnyObject, Model, model, property} from '@loopback/repository';
import {IResult} from 'mssql';
import {ProjectSummaryItem} from '../services';

@model()
export class WorkRefReadyDTO extends Model {
  @property({tyep: 'number'})
  id: number;
  @property({tyep: 'string'})
  owner_name: string;
  @property({tyep: 'string'})
  city: string;
  @property({tyep: 'number'})
  city_id: number;
  @property({tyep: 'string'})
  case_no: string;
  @property({tyep: 'date'})
  case_date: Date;
  @property({tyep: 'number'})
  sahmie_metraj: number;
  @property({tyep: 'number'})
  ttl: number;
  @property({tyep: 'string'})
  extra: string;
  @property({tyep: 'string'})
  Address_Street: string;
  @property({tyep: 'string'})
  TotalArea: string;
  @property({tyep: 'string'})
  TotalFloor: string;
  @property({tyep: 'boolean'})
  Useage_Maskooni: boolean;
  @property({tyep: 'boolean'})
  Useage_Edari: boolean;
  @property({tyep: 'boolean'})
  Useage_Tejari: boolean;
  @property({tyep: 'boolean'})
  Useage_Sanati: boolean;
  @property({tyep: 'boolean'})
  Useage_Damdari: boolean;
  @property({tyep: 'boolean'})
  Useage_Golkhane: boolean;
  @property({tyep: 'boolean'})
  Useage_Morghdari: boolean;
  @property({tyep: 'boolean'})
  Useage_TasisatShahri: boolean;
  @property({tyep: 'boolean'})
  Useage_Behdashti: boolean;
  @property({tyep: 'boolean'})
  Useage_Amoozeshi: boolean;
  @property({tyep: 'boolean'})
  Useage_Khadamati: boolean;
  @property({tyep: 'boolean'})
  Useage_Other: boolean;

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
