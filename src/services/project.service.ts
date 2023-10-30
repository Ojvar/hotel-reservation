/* eslint-disable @typescript-eslint/naming-convention */
import {BindingKey, BindingScope, inject, injectable} from '@loopback/core';
import {MsSqlService} from './ms-sql.service';
import {ProjectsSummaryDTO, ProjectSummaryDTO} from '../dto';
import {HttpErrors} from '@loopback/rest';
import {Filter} from '@loopback/repository';

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
     left join PlanControl_ProjectEngineers as ppe   on ppe.Project_Id = pcp.id
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
}
