import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {QengDataSource} from '../datasources';
import {
  BuildingGroupCondition,
  BuildingGroupConditionRelations,
} from '../models';

export class BuildingGroupConditionRepository extends DefaultCrudRepository<
  BuildingGroupCondition,
  typeof BuildingGroupCondition.prototype.id,
  BuildingGroupConditionRelations
> {
  constructor(@inject(QengDataSource.BINDING_KEY) dataSource: QengDataSource) {
    super(BuildingGroupCondition, dataSource);
  }
}
