import {Model, model, property} from '@loopback/repository';

/* eslint-disable @typescript-eslint/naming-convention */
export type FieldItemType = {
  title: string;
  nezarat: string | undefined;
  tarahi: string | undefined;
  ejra: string | undefined;
};
export type FieldType = Record<string, FieldItemType>;
export type LevelItemType = {
  id: string;
  title: string;
};
export type LevelType = Record<string, LevelItemType>;
export type JsonDataType = Record<string, FieldType | LevelType>;

@model()
export class EngineerDTO extends Model {
  @property({type: 'number'})
  id: number;
  @property({type: 'string'})
  code: string;
  @property({type: 'string'})
  enroldate: string;
  @property({type: 'string'})
  name: string;
  @property({type: 'string'})
  family: string;
  @property({type: 'string'})
  namefather: string;
  @property({type: 'string'})
  nation: string;
  @property({type: 'number'})
  shsh: number;
  @property({type: 'string'})
  sadereh: string;
  @property({type: 'string'})
  birthm: string;
  @property({type: 'string'})
  birthdate: string;
  @property({type: 'number'})
  nationcode: number;
  @property({type: 'number'})
  groupworkn: number;
  @property({type: 'number'})
  groupworke: number;
  @property({type: 'number'})
  groupworkt: number;
  @property({type: 'number'})
  groupworkgas: number;
  @property({type: 'number'})
  groupworkbarg: number;
  @property({type: 'string'})
  madrakdate: string;
  @property({type: 'string'})
  shbillet: string;
  @property({type: 'string'})
  billetdate: string;
  @property({type: 'string'})
  billetdatet: string;
  @property({type: 'string'})
  billetdatea: string;
  @property({type: 'number'})
  sexuality: number;
  @property({type: 'number'})
  married: number;
  @property({type: 'number'})
  religion: number;
  @property({type: 'number'})
  military: number;
  @property({type: 'number'})
  typebillet: number;
  @property({type: 'string'})
  firstname: string;
  @property({type: 'string'})
  lastname: string;
  @property({type: 'number'})
  summony: number;
  @property({type: 'number'})
  datemony: number;
  @property({type: 'string'})
  otherenrol: string;
  @property({type: 'string'})
  nameostan: string;
  @property({type: 'string'})
  shenrol: string;
  @property({type: 'string'})
  toostan: string;
  @property({type: 'string'})
  entegalidate: string;
  @property({type: 'number'})
  EnteghaliHaveShbillet: number;
  @property({type: 'string'})
  EnteghaliShbillet: string;
  @property({type: 'string'})
  EnteghaliPaye: string;
  @property({type: 'number'})
  isactive: number;
  @property({type: 'number'})
  english: number;
  @property({type: 'number'})
  germanism: number;
  @property({type: 'number'})
  french: number;
  @property({type: 'string'})
  author: string;
  @property({type: 'string'})
  pay_dirt: string;
  @property({type: 'number'})
  HasTeach: number;
  @property({type: 'string'})
  teach: string;
  @property({type: 'string'})
  teachtime: string;
  @property({type: 'string'})
  moredlove: string;
  @property({type: 'number'})
  aymored: number;
  @property({type: 'string'})
  nahveh: string;
  @property({type: 'string'})
  speciality: string;
  @property({type: 'number'})
  timeworkin: number;
  @property({type: 'number'})
  timeworkout: number;
  @property({type: 'string'})
  angoman: string;
  @property({type: 'string'})
  wostan: string;
  @property({type: 'string'})
  wstate: string;
  @property({type: 'string'})
  wcity: string;
  @property({type: 'string'})
  warea: string;
  @property({type: 'string'})
  wstreet: string;
  @property({type: 'number'})
  walley: number;
  @property({type: 'number'})
  wplate: number;
  @property({type: 'string'})
  wfloor: string;
  @property({type: 'number'})
  wcodepost: number;
  @property({type: 'number'})
  wcodecity: number;
  @property({type: 'string'})
  wcodetell: string;
  @property({type: 'string'})
  wtell: string;
  @property({type: 'string'})
  wfax: string;
  @property({type: 'string'})
  workplace: string;
  @property({type: 'string'})
  mokatebe_adr: string;
  @property({type: 'string'})
  mokatebe_codepost: string;
  @property({type: 'string'})
  mokatebe_tell: string;
  @property({type: 'string'})
  mokatebe_fax: string;
  @property({type: 'string'})
  nameorgan: string;
  @property({type: 'string'})
  hostan: string;
  @property({type: 'number'})
  hcity: number;
  @property({type: 'string'})
  harea: string;
  @property({type: 'string'})
  hstreet: string;
  @property({type: 'string'})
  hstreetf: string;
  @property({type: 'string'})
  halley: string;
  @property({type: 'number'})
  hplate: number;
  @property({type: 'string'})
  hfloor: string;
  @property({type: 'number'})
  hcodepost: number;
  @property({type: 'number'})
  hcodecity: number;
  @property({type: 'string'})
  hcodetell: string;
  @property({type: 'string'})
  htell: string;
  @property({type: 'string'})
  hfax: string;
  @property({type: 'string'})
  htellz: string;
  @property({type: 'string'})
  Person_image_old: string;
  @property({type: 'string'})
  person_badge: string;
  @property({type: 'string'})
  remarkArchive: string;
  @property({type: 'string'})
  person_sign: string;
  @property({type: 'number'})
  worktype: number;
  @property({type: 'string'})
  person_mohr: string;
  @property({type: 'number'})
  talig_status: number;
  @property({type: 'string'})
  talig_elat: string;
  @property({type: 'string'})
  talig_startdate: string;
  @property({type: 'string'})
  talig_enddate: string;
  @property({type: 'number'})
  ozviat_status: number;
  @property({type: 'number'})
  ismojri: number;
  @property({type: 'string'})
  sarresid_tell: string;
  @property({type: 'string'})
  shbillet2: string;
  @property({type: 'string'})
  billetdate2: string;
  @property({type: 'number'})
  groupworkn2: number;
  @property({type: 'string'})
  groupworke2: string;
  @property({type: 'number'})
  groupworkt2: number;
  @property({type: 'string'})
  NezaratDate3: string;
  @property({type: 'string'})
  TarrahiDate3: string;
  @property({type: 'string'})
  EjraDate3: string;
  @property({type: 'string'})
  NezaratDate2: string;
  @property({type: 'string'})
  TarrahiDate2: string;
  @property({type: 'string'})
  EjraDate2: string;
  @property({type: 'string'})
  NezaratDate1: string;
  @property({type: 'string'})
  TarrahiDate1: string;
  @property({type: 'string'})
  EjraDate1: string;
  @property({type: 'string'})
  NezaratDateArshad: string;
  @property({type: 'string'})
  TarrahiDateArshad: string;
  @property({type: 'string'})
  EjraDateArshad: string;
  @property({type: 'string'})
  HasWarning: string;
  @property({type: 'string'})
  WarningDescription: string;
  @property({type: 'number'})
  ResellerID: number;
  @property({type: 'string'})
  NoActiveDate: string;
  @property({type: 'string'})
  shbilletPic: string;
  @property({type: 'string'})
  BackshbilletPic: string;
  @property({type: 'string'})
  MelliCartPic: string;
  @property({type: 'string'})
  CertificateDescPic: string;
  @property({type: 'string'})
  CertificatePic: string;
  @property({type: 'string'})
  shshDate: string;
  @property({type: 'string'})
  shshSerial: string;
  @property({type: 'string'})
  BookletIndex: string;
  @property({type: 'string'})
  RegisterDomailPlace: string;
  @property({type: 'string'})
  job: string;
  @property({type: 'string'})
  remainStatus: string;
  @property({type: 'string'})
  RegisterDate: string;
  @property({type: 'string'})
  OfficeAddressCorrect: string;
  @property({type: 'string'})
  HomeAddressCorrect: string;
  @property({type: 'string'})
  CorrespondAddressCorrect: string;
  @property({type: 'string'})
  CorrectMobile: string;
  @property({type: 'number'})
  ShbilletSmsFlag: number;
  @property({type: 'number'})
  membershipsmsFlag: number;
  @property({type: 'string'})
  person_image: string;
  @property({type: 'string'})
  RegisterationCode: string;
  @property({type: 'number'})
  confirmation: number;
  @property({type: 'number'})
  IsVoted: number;
  @property({type: 'string'})
  IsBasijMember: string;
  @property({type: 'string'})
  IsArshadStudent: string;
  @property({type: 'string'})
  IsDoctoraStudent: string;
  @property({type: 'number'})
  BirthSmsFlag: number;
  @property({type: 'number'})
  Deposit: number;
  @property({type: 'string'})
  StatusChangeDate: string;
  @property({type: 'string'})
  StatusChangeReason: string;
  @property({type: 'number'})
  LicenseCreditDelivered: number;
  @property({type: 'string'})
  NationalCardImage: string;
  @property({type: 'string'})
  NationalBackCardImage: string;
  @property({type: 'string'})
  ShenasnameImage: string;
  @property({type: 'string'})
  EduImage: string;
  @property({type: 'string'})
  MilitaryCardImage: string;
  @property({type: 'string'})
  KardaniImage: string;
  @property({type: 'string'})
  ArshadImage: string;
  @property({type: 'string'})
  DoctoraImage: string;
  @property({type: 'string'})
  PricePaid: string;
  @property({type: 'number'})
  GiveBankCard: number;
  @property({type: 'string'})
  BillingNo: string;
  @property({type: 'string'})
  timestamp: string;
  @property({type: 'number'})
  OzviatMoneySource: number;
  @property({type: 'string'})
  OzviatMoneyDesc: string;
  @property({type: 'string'})
  RecordID: string;
  @property({type: 'string'})
  BillingConfirmed: string;
  @property({type: 'string'})
  HasAbfa: string;
  @property({type: 'string'})
  BankMelliCardPrinted: string;
  @property({type: 'string'})
  Mazhab: string;
  @property({type: 'string'})
  MokatebehCounty: string;
  @property({type: 'number'})
  MokatebehCityOrVillage: number;
  @property({type: 'string'})
  SokoonatCounty: string;
  @property({type: 'number'})
  SokoonatCityOrVillage: number;
  @property({type: 'number'})
  WorkCityOrVillage: number;
  @property({type: 'string'})
  Bank: string;
  @property({type: 'number'})
  VamPrice: number;
  @property({type: 'string'})
  VamDesc: string;
  @property({type: 'string'})
  VamReceiveDate: string;
  @property({type: 'string'})
  IsLiftController: string;
  @property({type: 'string'})
  Desc: string;
  @property({type: 'number'})
  PassTypeN: number;
  @property({type: 'number'})
  PassTypeT: number;
  @property({type: 'number'})
  PassTypeE: number;
  @property({type: 'number'})
  UpgradeN: number;
  @property({type: 'number'})
  UpgradeT: number;
  @property({type: 'number'})
  UpgradeE: number;
  @property({type: 'number'})
  DuplexPassTypeN: number;
  @property({type: 'number'})
  DuplexPassTypeT: number;
  @property({type: 'number'})
  DuplexUpgradeN: number;
  @property({type: 'number'})
  DuplexUpgradeT: number;
  @property({type: 'string'})
  DuplexNezaratDate3: string;
  @property({type: 'string'})
  DuplexNezaratDate2: string;
  @property({type: 'string'})
  DuplexNezaratDate1: string;
  @property({type: 'string'})
  DuplexNezaratDateArshad: string;
  @property({type: 'string'})
  DuplexTarahiDate3: string;
  @property({type: 'string'})
  DuplexTarahiDate2: string;
  @property({type: 'string'})
  DuplexTarahiDate1: string;
  @property({type: 'string'})
  DuplexTarahiDateArshad: string;
  @property({type: 'number'})
  NezaratRoostaee: number;
  @property({type: 'string'})
  Mahdoode: string;
  @property({type: 'string'})
  NezaratRoostaeeDate: string;
  @property({type: 'number'})
  Amoozesh: number;
  @property({type: 'string'})
  AmoozeshDate: string;
  @property({type: 'string'})
  AmoozeshDoreh: string;
  @property({type: 'number'})
  GasPiping: number;
  @property({type: 'string'})
  GasPipingDate: string;
  @property({type: 'string'})
  G: string;
  @property({type: 'string'})
  Email: string;
  @property({type: 'string'})
  UnConfirmedPersonImage: string;
  @property({type: 'string'})
  PersonImageConfirmed: string;
  @property({type: 'string'})
  UnconfirmedPersonSign: string;
  @property({type: 'string'})
  PersonSignConfirmed: string;
  @property({type: 'string'})
  PicConfirmation: string;
  @property({type: 'number'})
  BirthState: number;
  @property({type: 'number'})
  BirthCity: number;
  @property({type: 'number'})
  FatherType: number;
  @property({type: 'string'})
  EduType: string;
  @property({type: 'string'})
  EduLastMaghta: string;
  @property({type: 'number'})
  RegisterStatus: number;
  @property({type: 'string'})
  EnteghaliShbilletPic: string;
  @property({type: 'number'})
  EnteghaliState: number;
  @property({type: 'number'})
  IsShowImage: number;
  @property({type: 'string'})
  TransparentSignImage: string;
  @property({type: 'string'})
  LicenseDeliveredDate: string;
  @property({type: 'number'})
  isExotic: number;
  @property({type: 'number'})
  isElevator: number;
  @property({type: 'number'})
  arshadNezarat: number;
  @property({type: 'number'})
  arshadTarrahi: number;
  @property({type: 'number'})
  arshadEjra: number;
  @property({type: 'string'})
  creator_type: string;
  @property({type: 'string'})
  elevator_rate: string;
  @property({type: 'string'})
  userId: string;
  @property({type: 'number'})
  red_crescent: number;
  @property({type: 'string'})
  GuardDate: string;
  @property({type: 'string'})
  ImprovementDate: string;

  constructor(data?: Partial<EngineerDTO>) {
    super(data);
  }
}