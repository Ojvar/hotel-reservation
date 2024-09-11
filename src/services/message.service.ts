import {BindingKey, BindingScope, inject, injectable} from '@loopback/core';
import {SmsMessage} from '../dto';
import {RabbitmqBindings, RabbitmqProducer} from '../loopback-rabbitmq/src';

@injectable({scope: BindingScope.APPLICATION})
export class MessageService {
  static BINDING_KEY = BindingKey.create<MessageService>(
    `services.${MessageService.name}`,
  );

  constructor(
    @inject(RabbitmqBindings.RABBITMQ_PRODUCER)
    private rabbitmqProducer: RabbitmqProducer,
  ) {}

  async sendSms(sms: SmsMessage): Promise<void> {
    console.debug(sms);
    await this.rabbitmqProducer.publish(
      'message',
      'sms',
      Buffer.from(JSON.stringify(sms)),
    );
  }
}
