/* eslint-disable @typescript-eslint/naming-convention */
import {BindingKey, BindingScope, inject, injectable} from '@loopback/core';
import {BuildingProjectStaffItemDTO, RmqStaffAcceptDTO} from '../dto';
import {RMQ_EXCHANGES} from '../helpers';
import {RabbitmqBindings, RabbitmqProducer} from '../loopback-rabbitmq/src';
import {
  BuildingProject,
  BuildingProjectTechSpecs,
  BuildingProjectWithRelations,
  EnumProgressStatus,
} from '../models';

export enum EnumBuildingProjectRmqMessageType {
  OPERATOR_CONFORM = 'project_confirmed',
  STAFF_ACCEPT = 'staff_accept',
  TECH_SPEC_ITEM_INSERT = 'tech_spec_item_insert',
  TECH_SPEC_ITEM_REMOVE = 'tech_spec_item_remove',
  FILE_CHANGE = 'file_change',
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

  publishStaffUpdate(project: BuildingProject, staffId: string): Promise<void> {
    const staff = project.staff?.find(x => x.id?.toString() === staffId);
    if (!staff) {
      return Promise.resolve();
    }

    const data = {
      type: EnumBuildingProjectRmqMessageType.STAFF_ACCEPT,
      data: new RmqStaffAcceptDTO({
        staff: BuildingProjectStaffItemDTO.fromModel(staff),
        project_id: project.id?.toString(),
      }),
    };
    return this.rmqProducer.publish(
      RMQ_EXCHANGES.BUILDING_PROJECTS.name,
      RMQ_EXCHANGES.BUILDING_PROJECTS.queues.BUILDING_PROJECTS.routingKey,
      Buffer.from(JSON.stringify(data)),
    );
  }

  publishTechnicalSpecUpdates(
    project: BuildingProject,
    userData: BuildingProjectTechSpecs | string,
    opType:
      | EnumBuildingProjectRmqMessageType.TECH_SPEC_ITEM_INSERT
      | EnumBuildingProjectRmqMessageType.TECH_SPEC_ITEM_REMOVE,
  ): Promise<void> {
    const data = {
      type: opType,
      data: {
        project_id: project.id?.toString(),
        data: userData,
      },
    };
    return this.rmqProducer.publish(
      RMQ_EXCHANGES.BUILDING_PROJECTS.name,
      RMQ_EXCHANGES.BUILDING_PROJECTS.queues.BUILDING_PROJECTS.routingKey,
      Buffer.from(JSON.stringify(data)),
    );
  }

  publishProjectUpdates(project: BuildingProjectWithRelations): Promise<void> {
    switch (project.progress_status) {
      // REMOVE SEND DATA IN FIRST COMMIT
      // case EnumProgressStatus.OFFICE_DATA_CONFIRMED:
      //   return this.sendBuildingProjectStateConfirmed(project);
      case EnumProgressStatus.OFFICE_DESIGNERS_LIST_CONFIRMED:
        return this.sendBuildingProjectStateConfirmed(project);
      default:
        return Promise.resolve();
    }
  }

  private sendBuildingProjectStateConfirmed(
    project: BuildingProjectWithRelations,
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
