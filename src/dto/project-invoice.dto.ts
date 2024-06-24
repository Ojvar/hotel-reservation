/* eslint-disable @typescript-eslint/naming-convention */
import {AnyObject, Model, model, property} from '@loopback/repository';
import {
  BuildingProjectInvoice,
  BuildingProjectInvoiceInfo,
  ModifyStamp,
} from '../models';

@model()
export class BuildingProjectInvoiceFilter extends Model {
  @property.array(String, {required: true})
  tags: string[];
  @property({type: 'object', required: true})
  meta: AnyObject;

  constructor(data?: Partial<BuildingProjectInvoiceFilter>) {
    super(data);
  }
}

@model()
export class NewBuildingProjectInvoiceRequestDTO extends Model {
  @property.array(String, {required: true})
  tags: string[];
  @property({type: 'object', required: true})
  meta: AnyObject;

  constructor(data?: Partial<NewBuildingProjectInvoiceRequestDTO>) {
    super(data);
  }

  toModel(userId: string): BuildingProjectInvoice {
    const now = new ModifyStamp({by: userId});
    return new BuildingProjectInvoice({
      created: now,
      updated: now,
      invoice: new BuildingProjectInvoiceInfo({
        tags: this.tags,
        meta: this.meta,
      }),
    });
  }
}

@model()
export class BuildingProjectInvoiceInfoDTO extends Model {
  @property.array(String, {required: true})
  tags: string[];
  @property({type: 'object', required: true})
  meta: AnyObject;

  constructor(data?: Partial<BuildingProjectInvoiceInfoDTO>) {
    super(data);
  }

  static fromModel(
    data: BuildingProjectInvoiceInfo,
  ): BuildingProjectInvoiceInfoDTO {
    return new BuildingProjectInvoiceInfoDTO({
      tags: data.tags,
      meta: data.meta,
    });
  }
}

@model()
export class BuildingProjectInvoiceDTO extends Model {
  @property({type: 'string'})
  id: string;
  @property({type: 'date'})
  created_at: Date;
  @property({type: 'date'})
  updated_at: Date;
  @property({})
  invoice: BuildingProjectInvoiceInfoDTO;

  constructor(data?: Partial<BuildingProjectInvoiceDTO>) {
    super(data);
  }

  static fromModel(data: BuildingProjectInvoice): BuildingProjectInvoiceDTO {
    return new BuildingProjectInvoiceDTO({
      id: data.id,
      created_at: data.created.at,
      updated_at: data.updated.at,
      invoice: BuildingProjectInvoiceInfoDTO.fromModel(data.invoice),
    });
  }
}
export type BuildingProjectInvoicesDTO = BuildingProjectInvoiceDTO[];

@model()
export class BuildingProjectInvoicesListDTO extends Model {
  @property({})
  id: string;
  @property({})
  created_at: Date;
  @property({})
  updated_at: Date;
  @property.array(BuildingProjectInvoiceDTO, {})
  invoices: BuildingProjectInvoicesDTO;

  constructor(data?: Partial<BuildingProjectInvoicesListDTO>) {
    super(data);
  }

  static fromModel(data: AnyObject): BuildingProjectInvoicesListDTO {
    return new BuildingProjectInvoicesListDTO({
      id: data.id,
      created_at: data.created.at,
      updated_at: data.updated_at,
      invoices: data.invoices.map(BuildingProjectInvoiceDTO.fromModel),
    });
  }
}
export type BuildingProjectInvoicesListsDTO = BuildingProjectInvoicesListDTO[];
