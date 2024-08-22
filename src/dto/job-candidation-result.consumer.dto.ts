/* eslint-disable @typescript-eslint/naming-convention */
import {Model, model, property} from '@loopback/repository';

@model({settings: {strict: false}})
export class JobCandiateResultJobMetaDTO extends Model {
  @property({type: 'string'})
  id: string;
  @property({type: 'string'})
  ownerName: string;
  @property({type: 'string'})
  address: string;
  @property({})
  totalArea: number;
  @property({})
  totalFloor: number;
  @property({type: 'string'})
  caseNo: string;
  @property({type: 'string'})
  caseDate: string;
  @property({type: 'string'})
  nosaziCode: string;
  @property({type: 'string'})
  projectType: string;
  @property({})
  maskooniUnits: number;
  @property({})
  tejariUnits: number;
  @property({type: 'string'})
  group: string;
  @property({type: 'string'})
  subGroup: string;
  @property({type: 'string'})
  city_id: string;
  @property({})
  amount: number;
  @property({type: 'string'})
  refLicenseLevel: string;
  @property({type: 'string'})
  refTotalMeterage: string;
  @property({})
  refWorkType: number;
  @property({type: 'string'})
  refLicenseType: string;

  [key: string]: unknown;

  constructor(data?: Partial<JobCandiateResultJobMetaDTO>) {
    super(data);
  }
}

@model()
export class JobCandiateResultJobDTO extends Model {
  @property({id: true, type: 'string'})
  id: string;
  @property({})
  meta: JobCandiateResultJobMetaDTO;
  @property({})
  status: number;

  constructor(data?: Partial<JobCandiateResultJobDTO>) {
    super(data);
  }
}

@model()
export class JobCandiateResultRelatedDataDTO extends Model {
  @property({type: 'string'})
  user_id: string;
  @property({})
  score: number;
  @property({type: 'string'})
  job_id: string;
  @property({type: 'string'})
  register_date: string;
  @property({})
  priority: number;

  constructor(data?: Partial<JobCandiateResultRelatedDataDTO>) {
    super(data);
  }
}

@model()
export class JobCandiateResultMetaData extends Model {
  @property.array(JobCandiateResultRelatedDataDTO)
  relatedData: JobCandiateResultRelatedDataDTO[];
  @property.array(String)
  users: string[];

  constructor(data?: Partial<JobCandiateResultMetaData>) {
    super(data);
  }
}

@model()
export class JobCandiateResultMetaDTO extends Model {
  @property({nullable: true})
  error: string | null;
  @property()
  data?: JobCandiateResultMetaData;

  constructor(data?: Partial<JobCandiateResultMetaDTO>) {
    super(data);
  }
}

@model()
export class JobCandiateScheduleResultDTO extends Model {
  @property({})
  created_at: Date;
  @property({})
  meta: JobCandiateResultMetaDTO;

  constructor(data?: Partial<JobCandiateScheduleResultDTO>) {
    super(data);
  }
}

@model()
export class JobCandiateScheduleDTO extends Model {
  @property({id: true, type: 'string'})
  id: string;
  @property({})
  from: Date;
  @property({})
  to: Date;
  @property({})
  status: number;
  @property({})
  result: JobCandiateScheduleResultDTO;

  constructor(data?: Partial<JobCandiateScheduleDTO>) {
    super(data);
  }
}

@model()
export class JobCandiateResultDTO extends Model {
  @property({})
  published_at: Date;
  @property({})
  job: JobCandiateResultJobDTO;
  @property({})
  schedule: JobCandiateScheduleDTO;

  constructor(data?: Partial<JobCandiateResultDTO>) {
    super(data);
  }
}
