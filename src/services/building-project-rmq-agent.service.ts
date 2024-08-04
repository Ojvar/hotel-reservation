import {BindingKey, BindingScope, inject, injectable} from '@loopback/core';
import {RabbitmqBindings, RabbitmqProducer} from '../loopback-rabbitmq/src';
import {BuildingProject, EnumProgressStatus} from '../models';
import {RMQ_EXCHANGES} from '../helpers';

export enum EnumBuildingProjectRmqMessageType {
  OPERATOR_CONFORM = 'project_confirmed',
}

@injectable({scope: BindingScope.APPLICATION})
export class BuildingProjectRmqAgentService {
  static readonly BINDING_KEY =
    BindingKey.create<BuildingProjectRmqAgentService>(
      `services.${BuildingProjectRmqAgentService.name}`,
    );

  constructor(
    @inject(RabbitmqBindings.RABBITMQ_PRODUCER)
    private rmqProducer: RabbitmqProducer,
  ) {}

  publishProjectUpdates(project: BuildingProject): Promise<void> {
    switch (project.progress_status) {
      case EnumProgressStatus.OFFICE_DATA_CONFIRMED:
        return this.sendBuildingProjectStateConfirmed(project);
      default:
        return Promise.resolve();
    }
  }

  private sendBuildingProjectStateConfirmed(
    project: BuildingProject,
  ): Promise<void> {
    const data = {
      type: EnumBuildingProjectRmqMessageType.OPERATOR_CONFORM,
      data: new BuildingProject({...project}),
    };
    return this.rmqProducer.publish(
      RMQ_EXCHANGES.BUILDING_PROJECTS.name,
      RMQ_EXCHANGES.BUILDING_PROJECTS.queues.BUILDING_PROJECTS.routingKey,
      Buffer.from(JSON.stringify(data)),
    );
  }
}
