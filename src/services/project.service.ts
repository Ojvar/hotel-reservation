/* eslint-disable @typescript-eslint/naming-convention */
import {BindingKey, BindingScope, inject, injectable} from '@loopback/core';
import {MsSqlService} from './ms-sql.service';
import {ProjectSummaryDTO} from '../dto';
import {HttpErrors} from '@loopback/rest';

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
  total_area: number;
  total_floor: number;
  total_parking: number | null;
  total_anbari: number | null;
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

  async getProjectSummaryByCaseNo(caseNo: string): Promise<ProjectSummaryDTO> {
    const query = `
select  pcp.*,
        ppe.EngType as engineer_type,
        ppe.personel_id as personel_id,
        p.name as engineer_name,
        p.family as engineer_family,
        p.sexuality as gender,
        p.shbillet as shbillet
from    
       (
          select  id,
                  CaseNo as case_no,
                  Owner_Name as owner_name,
                  Owner_Father as owner_father,
                  OwnerMobile as owner_mobile,
                  Owner_shsh as owner_shsh,
                  TotalArea as totoal_area,
                  TotalFloor as total_floor,
                  TotalParking as total_parking,
                  TotalAnbari as total_anbari,
                  ProjectType as project_type
          from    PlanControl_Projects
          where   CaseNo = '${caseNo}'
       ) as pcp
        left join PlanControl_ProjectEngineers as ppe   on ppe.Project_Id = pcp.id
        left join personnel as p                        on p.id = ppe.Personel_Id
`;
    const result =
      await this.sqlService.runQueryWithResult<ProjectSummaryItem>(query);
    if (!result.recordset[0]) {
      throw new HttpErrors.UnprocessableEntity('Invalid case_no value');
    }
    return ProjectSummaryDTO.fromData(result);
  }
}
