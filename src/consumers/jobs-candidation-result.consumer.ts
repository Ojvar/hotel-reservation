import {ConsumeMessage, rabbitConsume} from '../loopback-rabbitmq/src';
import {RMQ_EXCHANGES} from '../helpers';
import {JobCandiateResultDTO} from '../dto';
import {repository} from '@loopback/repository';
import {BuildingProjectRepository} from '../repositories';

export class JobCandiateResultConsumer {
  constructor(
    @repository(BuildingProjectRepository)
    private buildingProjectRepo: BuildingProjectRepository,
  ) {}

  @rabbitConsume({
    exchange: RMQ_EXCHANGES.JOBS.name,
    routingKey: RMQ_EXCHANGES.JOBS.queues.JOBS_CANDIDATION_RESULT.routingKey,
    queue: RMQ_EXCHANGES.JOBS.queues.JOBS_CANDIDATION_RESULT.name,
  })
  handle(
    message: JobCandiateResultDTO,
    _rawMessage: ConsumeMessage,
  ): Promise<void> {
    return this.buildingProjectRepo.updateJobData(
      'SYSTEM',
      new JobCandiateResultDTO({...message}),
    );
  }
}
