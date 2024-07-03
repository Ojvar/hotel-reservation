import {ConsumeMessage, rabbitConsume} from '../loopback-rabbitmq/src';
import {RMQ_EXCHANGES} from '../helpers';
import {JobCandiateResultDTO} from '../dto';
import {inject} from '@loopback/context';
import {ProjectManagementService} from '../services';

export class AuthNewUserConsumer {
  constructor(
    @inject(ProjectManagementService.BINDING_KEY)
    private projectManagementService: ProjectManagementService,
  ) {}

  @rabbitConsume({
    exchange: RMQ_EXCHANGES.JOBS.name,
    routingKey: RMQ_EXCHANGES.JOBS.queues.JOBS_CANDIDATION_RESULT.route_key,
    queue: RMQ_EXCHANGES.JOBS.queues.JOBS_CANDIDATION_RESULT.name,
  })
  async handle(message: JobCandiateResultDTO, _rawMessage: ConsumeMessage) {
    await this.projectManagementService.updateJobData(
      'SYSTEM',
      new JobCandiateResultDTO({...message}),
    );
  }
}
