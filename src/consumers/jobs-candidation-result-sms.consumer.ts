/* eslint-disable @typescript-eslint/naming-convention */
import {ConsumeMessage, rabbitConsume} from '../loopback-rabbitmq/src';
import {RMQ_EXCHANGES} from '../helpers';
import {JobCandiateResultDTO, SmsMessage} from '../dto';
import {inject} from '@loopback/context';
import {MessageService, Wordpress, WordpressProvider} from '../services';
import {repository} from '@loopback/repository';
import {ProfileRepository} from '../repositories';
import {KeycloakAgentService} from '../lib-keycloak/src';

export class JobCandiateResultSmsConsumer {
  constructor(
    @inject(MessageService.BINDING_KEY) private messageService: MessageService,
    @inject(WordpressProvider.BINDING_KEY) private wordpressService: Wordpress,
    @inject(KeycloakAgentService.BINDING_KEY)
    private kcAgentServie: KeycloakAgentService,
    @repository(ProfileRepository) private profileRepository: ProfileRepository,
  ) {}

  @rabbitConsume({
    exchange: RMQ_EXCHANGES.JOBS.name,
    routingKey:
      RMQ_EXCHANGES.JOBS.queues.JOBS_CANDIDATION_RESULT_MSG.routingKey,
    queue: RMQ_EXCHANGES.JOBS.queues.JOBS_CANDIDATION_RESULT_MSG.name,
  })
  async handle(message: JobCandiateResultDTO, rawMessage: ConsumeMessage) {
    await this.sendSms(message, rawMessage);
    await this.callWpRoutes(message, rawMessage);
  }

  async sendSms(
    message: JobCandiateResultDTO,
    _rawMessage: ConsumeMessage,
  ): Promise<void> {
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

  // TODO: this is a temporary function,
  //  it should be remove in the future versions
  async callWpRoutes(
    message: JobCandiateResultDTO,
    _rawMessage: ConsumeMessage,
  ): Promise<void> {
    const selectedUsers = message.schedule.result.meta.data?.users;
    if (!selectedUsers) {
      return;
    }

    const {
      job: {
        meta: {caseNo, id: jobId},
      },
      published_at: jobDate,
    } = message;
    const {access_token} = await this.kcAgentServie.getAdminToken();

    for (const user of selectedUsers) {
      const profile = await this.profileRepository.findOne({
        where: {user_id: user},
      });
      if (!profile) {
        continue;
      }
      // Call wordpress route
      await this.wordpressService.setEngineerPadafand(
        access_token,
        caseNo,
        jobId,
        jobDate,
        profile.n_in,
      );
    }
  }
}
