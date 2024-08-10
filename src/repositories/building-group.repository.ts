import { inject } from '@loopback/core';
import { DefaultCrudRepository } from '@loopback/repository';
import { QengDataSource } from '../datasources';
import { BuildingGroup, BuildingGroupRelations } from '../models';

export class BuildingGroupRepository extends DefaultCrudRepository<
  BuildingGroup,
  typeof BuildingGroup.prototype.id,
  BuildingGroupRelations
> {
  constructor(@inject(QengDataSource.BINDING_KEY) dataSource: QengDataSource) {
    super(BuildingGroup, dataSource);
  }
}
