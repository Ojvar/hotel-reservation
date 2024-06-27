/* eslint-disable @typescript-eslint/naming-convention */
import {BindingKey, BindingScope, inject, injectable} from '@loopback/core';
import {RedisService} from '../lib-redis/src';
import {MessageService} from './message.service';
import {Profile} from '../models';
import {HttpErrors} from '@loopback/rest';
import {randomNumber} from '../helpers';
import {SmsMessage} from '../dto';
import {AnyObject} from '@loopback/repository';

type RedisVerificationCode = {
  n_id: string;
  tracking_code: string;
  code: number;
  meta: AnyObject;
};

@injectable({scope: BindingScope.APPLICATION})
export class VeirificationCodeService {
  static BINDING_KEY = BindingKey.create<VeirificationCodeService>(
    `services.${VeirificationCodeService.name}`,
  );

  readonly C_PROJECT_MANAGMENET_SMS_TAG = 'REG_PRJ';
  readonly C_PROJECT_MANAGMENET_SMS_SENDER = 'PROJECTS_SERVICE';
  readonly C_PRJ_MGR = 'prj_mgr';

  constructor(
    @inject(RedisService.BINDING_KEY) private redisService: RedisService,
    @inject(MessageService.BINDING_KEY) private messageService: MessageService,
  ) {}

  getKey(data: (string | number)[]): string {
    return data.map(x => x.toString()).join('-');
  }

  async generateAndStoreCode(
    title: string,
    owner: Profile,
    postfix: string | number,
    expireTime: number = 180,
    meta: AnyObject = {},
  ): Promise<string> {
    const key = this.getKey([this.C_PRJ_MGR, owner.n_in, postfix]);

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

    const value: RedisVerificationCode = {
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
    const smsMessage = new SmsMessage({
      sender: this.C_PROJECT_MANAGMENET_SMS_SENDER,
      tag: this.C_PROJECT_MANAGMENET_SMS_TAG,
      body: msg,
      receiver: owner.mobile,
    });
    await this.messageService.sendSms(smsMessage);

    return trackingCode;
  }

  async checkVerificationCodeByNId(
    nIn: string,
    postfix: number,
    verificationCode: number,
  ): Promise<void> {
    const key = this.getKey([this.C_PRJ_MGR, nIn, postfix]);

    // Check for existing code
    const oldRedisData = await this.redisService.client.GET(key);
    if (!oldRedisData) {
      throw new HttpErrors.UnprocessableEntity('Validation code is not exists');
    }

    const storedData = JSON.parse(oldRedisData) as RedisVerificationCode;
    if (storedData.code.toString() !== verificationCode.toString()) {
      throw new HttpErrors.UnprocessableEntity('Invalid verification code');
    }
  }

  async removeVerificationCodeByNId(
    nIn: string,
    postfix: number,
  ): Promise<void> {
    const key = this.getKey([this.C_PRJ_MGR, nIn, postfix]);
    await this.redisService.client.DEL(key);
  }
}
