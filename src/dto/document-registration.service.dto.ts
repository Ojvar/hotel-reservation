import {Model, model, property} from '@loopback/repository';

@model()
export class DocumentValidationPersonDTO extends Model {
  @property({type: 'string'}) nationalNo: string;
  @property({type: 'string'}) name: string;
  @property({type: 'string'}) family: string;
  @property({type: 'string'}) agentType: string;
  @property({type: 'string'}) personType: string;
  @property({type: 'string'}) nationalNoMovakel: string;
  @property({type: 'string'}) nameMovakel: string;
  @property({type: 'string'}) familyMovakel: string;
  @property({type: 'string'}) roleType: string;
  @property({type: 'string', nullable: true}) txtRelation?: string | null;

  constructor(data?: Partial<DocumentValidationPersonDTO>) {
    super(data);
  }
}
export type DocumentValidationPersonsDTO = DocumentValidationPersonDTO[];

@model()
export class DocumentValidationDataDTO extends Model {
  @property({type: 'boolean'}) succseed: boolean;
  @property({type: 'boolean'}) hasPermission: boolean;
  @property({type: 'boolean'}) existDoc: boolean;
  @property({type: 'string'}) nationalRegisterNo: string;
  @property({type: 'string'}) docType: string;
  @property({type: 'string'}) scriptoriumName: string;
  @property({type: 'string'}) docDate: string;
  @property({type: 'string'}) caseClasifyNo: string;
  @property({type: 'string'}) impotrtantAnnexText: string;
  @property({type: 'string', nullable: true}) desc?: string | null;
  @property({type: 'string', nullable: true}) signGetterTitle?: string | null;
  @property({type: 'string', nullable: true}) signSubject?: string | null;
  @property({type: 'string', nullable: true}) docImage?: string | null;
  @property.array(DocumentValidationPersonDTO, {})
  lstFindPersonInQuery: DocumentValidationPersonsDTO;

  constructor(data?: Partial<DocumentValidationDataDTO>) {
    super(data);
  }
}

@model()
export class DocumentValidationResultDTO extends Model {
  @property({type: 'boolean'}) success: boolean;
  @property({type: 'string'}) message: string;
  @property({}) data: DocumentValidationDataDTO;

  constructor(data?: Partial<DocumentValidationResultDTO>) {
    super(data);
  }
}
