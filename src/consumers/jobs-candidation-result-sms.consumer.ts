/* eslint-disable @typescript-eslint/naming-convention */
import {ConsumeMessage, rabbitConsume} from '../loopback-rabbitmq/src';
import {RMQ_EXCHANGES} from '../helpers';
import {JobCandiateResultDTO, SmsMessage} from '../dto';
import {inject} from '@loopback/context';
import {MessageService} from '../services';
import {repository} from '@loopback/repository';
import {ProfileRepository} from '../repositories';

export class JobCandiateResultSmsConsumer {
  constructor(
    @inject(MessageService.BINDING_KEY) private messageService: MessageService,
    @repository(ProfileRepository) private profileRepository: ProfileRepository,
  ) {}

  @rabbitConsume({
    exchange: RMQ_EXCHANGES.JOBS.name,
    routingKey:
      RMQ_EXCHANGES.JOBS.queues.JOBS_CANDIDATION_RESULT_MSG.routingKey,
    queue: RMQ_EXCHANGES.JOBS.queues.JOBS_CANDIDATION_RESULT_MSG.name,
  })
  async handle(message: JobCandiateResultDTO, _rawMessage: ConsumeMessage) {
    const selectedUsers = message.schedule.result.meta.data?.users;

    if (!selectedUsers) {
      return;
    }

    for (const user of selectedUsers) {
      const profile = await this.profileRepository.findOne({
        where: {user_id: user},
      });
      if (!profile) {
        continue;
      }
      const body = `مهندس گرامی ${profile.first_name} ${profile.last_name}
شما در پروژه ${message.job.meta.caseNo} انتخاب شده اید
لطفا برای کسب اطلاعات بیشتر به پورتال خود مراجعه فرمایید
`;
      await this.messageService.sendSms(
        new SmsMessage({
          body,
          receiver: profile.mobile,
          tag: 'JOB-CANDIDATION',
          sender: 'PROJECT-SERVICE',
        }),
      );
    }
  }
}
