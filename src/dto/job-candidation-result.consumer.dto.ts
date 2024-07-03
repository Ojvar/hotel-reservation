/* eslint-disable @typescript-eslint/naming-convention */
import {Model, model, property} from '@loopback/repository';

@model({settings: {strict: false}})
export class JobCandiateResultJobMetaDTO extends Model {
  @property({})
  id: string;
  @property({})
  ownerName: string;
  @property({})
  address: string;
  @property({})
  totalArea: number;
  @property({})
  totalFloor: number;
  @property({})
  caseNo: string;
  @property({})
  caseDate: string;
  @property({})
  nosaziCode: string;
  @property({})
  projectType: string;
  @property({})
  maskooniUnits: number;
  @property({})
  tejariUnits: number;
  @property({})
  group: string;
  @property({})
  subGroup: string;
  @property({})
  city_id: string;
  @property({})
  amount: number;
  @property({})
  refLicenseLevel: string;
  @property({})
  refTotalMeterage: string;
  @property({})
  refWorkType: number;
  @property({})
  refLicenseType: string;

  [key: string]: unknown;

  constructor(data?: Partial<JobCandiateResultJobMetaDTO>) {
    super(data);
  }
}

@model()
export class JobCandiateResultJobDTO extends Model {
  @property({id: true})
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
  @property({})
  user_id: string;
  @property({})
  score: number;
  @property({})
  job_id: string;
  @property({})
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
  @property({id: true})
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
