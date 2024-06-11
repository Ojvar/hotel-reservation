/* eslint-disable @typescript-eslint/naming-convention */
import {Model, model, property} from '@loopback/repository';

@model()
export class SendSMSRequest extends Model {
  @property({type: 'string'})
  nin: string;
  @property({type: 'string'})
  pwd: string;
  @property({type: 'boolean'})
  exists: boolean;
  @property({type: 'string'})
  mobile: string;

  constructor(data?: Partial<SendSMSRequest>) {
    super(data);
  }
}

@model()
export class SmsMessage extends Model {
  @property({type: 'string', required: false})
  provider?: string;
  @property({type: 'string', required: false})
  receiver: string;
  @property({type: 'string', required: false})
  send_date?: string;
  @property({type: 'string', required: true})
  body: string;
  @property({type: 'string', required: true})
  sender: string;
  @property({type: 'string', required: true})
  tag: string;

  constructor(data?: Partial<SmsMessage>) {
    super(data);
  }
}
