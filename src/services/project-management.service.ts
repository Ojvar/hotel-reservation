/* eslint-disable @typescript-eslint/naming-convention */
import {BindingKey, BindingScope, inject, injectable} from '@loopback/core';
import {RedisService} from '../lib-redis/src';
import {randomNumber} from '../helpers';
import {Profile} from '../models';
import {MessageService} from './message.service';
import {SmsMessage} from '../dto';
import {HttpErrors} from '@loopback/rest';
import {ProjectRegistrationCodeDTO} from '../dto/project-management.dto';
import {repository} from '@loopback/repository';
import {ProfileRepository} from '../repositories';

export const ProjectManagementSteps = {
  REGISTRATION: {code: 0, title: 'ثبت پروژه'},
  DESIGNER_SPECIFICATION: {code: 1, title: 'تغیین مهندس طراح'},
};

export enum EnumRegisterProjectType {
  REG_PROJECT = 1,
  REG_DESIGNER = 2,
}

@injectable({scope: BindingScope.TRANSIENT})
export class ProjectManagementService {
  static BINDING_KEY = BindingKey.create<ProjectManagementService>(
    `services.${ProjectManagementService.name}`,
  );

  readonly C_PROJECT_MANAGMENET_SMS_TAG = 'REG_PRJ';
  readonly C_PROJECT_MANAGMENET_SMS_SENDER = 'PROJECTS_SERVICE';
  readonly C_PROJECT_REGISTRATION_TITLE = 'ثبت پروژه';

  constructor(
    @repository(ProfileRepository) private profileRepo: ProfileRepository,
    @inject(RedisService.BINDING_KEY) private redisService: RedisService,
    @inject(MessageService.BINDING_KEY) private messageService: MessageService,
  ) {}

  async sendProjectRegistrationCode(
    nId: string,
  ): Promise<ProjectRegistrationCodeDTO> {
    const userProfile = await this.profileRepo.findByNIdOrFail(nId);
    const trackingCode = await this.generateAndStoreCode(
      this.C_PROJECT_REGISTRATION_TITLE,
      userProfile,
      EnumRegisterProjectType.REG_PROJECT,
    );
    return new ProjectRegistrationCodeDTO({tracking_code: trackingCode});
  }

  async generateAndStoreCode(
    title: string,
    owner: Profile,
    type: EnumRegisterProjectType,
    expireTime: number = 180,
    meta = {},
  ): Promise<string> {
    const key = `PRJ_MGR_${owner.n_in}_${type}`;

    // Check for existing code
    const oldRedisData = await this.redisService.client.GET(key);
    if (oldRedisData) {
      throw new HttpErrors.UnprocessableEntity('Validation code is generated');
    }

    // Generate new code
    const code = randomNumber(10_000_000, 999_999_99);
    let trackingCode =
      (+new Date()).toString() + randomNumber(10_000_000, 999_999_99);
    trackingCode = Buffer.from(trackingCode).toString('base64');

    const value = {
      n_id: owner.n_in,
      tracking_code: trackingCode,
      code,
      meta,
    };

    // Store in redis
    await this.redisService.client.SET(
      key,
      Buffer.from(JSON.stringify(value)),
      {EX: expireTime},
    );

    // Send sms
    const ownerName = owner.first_name + ' ' + owner.last_name;
    const msg = `مالک گرامی، ${ownerName} (${owner.n_in})
کد تایید جهت ${title}
${code}

مهلت اعتبار ${expireTime / 60} دقیقه
`;
    await this.messageService.sendSms(
      new SmsMessage({
        sender: this.C_PROJECT_MANAGMENET_SMS_SENDER,
        tag: this.C_PROJECT_MANAGMENET_SMS_TAG,
        body: msg,
        receiver: owner.mobile,
      }),
    );

    return trackingCode;
  }
}
