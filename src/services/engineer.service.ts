import {BindingKey, BindingScope, inject, injectable} from '@loopback/core';
import {AnyObject} from '@loopback/repository';
import Data from '../static/data.json';
import {MsSqlService} from './ms-sql.service';
import {EngineerDTO} from '../dto/engineer.dto';
import {HttpErrors} from '@loopback/rest';

@injectable({scope: BindingScope.APPLICATION})
export class EngineerService {
  static BINDING_KEY = BindingKey.create<EngineerService>(
    `services.${EngineerService.name}`,
  );

  private FIELD_SEPARATOR = '،';

  constructor(
    @inject(MsSqlService.BINDING_KEY) private msSqlService: MsSqlService,
  ) {}

  private getEngineerDataSql = (nId: string): string => `
   SELECT  *
   FROM    personnel
   WHERE   nationcode = '${nId}'
`;

  async parseUser(nId: string): Promise<Record<string, AnyObject>> {
    const level = Data.level as AnyObject;
    const nullLevel = level['4'];

    const user: AnyObject | undefined = await this.getUserData(nId);
    if (!user) {
      throw new HttpErrors.NotFound('Invalid user data');
    }

    const [_province, reshteh, ..._other] = user.code.split('_');
    const fields = reshteh
      .replace(/\)|\(/gi, '')
      .split(this.FIELD_SEPARATOR)
      .map((x: any) => (Data.fields as AnyObject)[x]);

    const licenses = fields.map((field: any, i: number) => {
      const n = i > 0 ? (i + 1).toString() : '';
      const res = {
        level: i + 1,
        field,
        work_n: level[String(user[`groupworkn${n}`])] ?? nullLevel,
        work_t: level[String(user[`groupworkt${n}`])] ?? nullLevel,
        work_e: level[String(user[`groupworke${n}`])] ?? nullLevel,
        work_gas: level[String(user[`groupworkgas${n}`])] ?? nullLevel,
        work_bargh: level[String(user[`groupworkbargh${n}`])] ?? nullLevel,
      };
      res.field = {
        ...res.field,
        nezarat: !!res.work_n.title ? res.work_n.id : undefined,
        ejra: !!res.work_e.title ? res.work_e.id : undefined,
        tarahi: !!res.work_t.title ? res.work_t.id : undefined,
      };
      return res;
    });

    return {fields, licenses};
  }

  async getUserData(nId: string): Promise<EngineerDTO | undefined> {
    const result = await this.msSqlService.runQueryWithResult<EngineerDTO>(
      this.getEngineerDataSql(nId),
    );
    return result.recordset[0];
  }
}
