import {inject, Getter} from '@loopback/core';
import {
  DefaultCrudRepository,
  repository,
  BelongsToAccessor,
} from '@loopback/repository';
import {QengDataSource} from '../datasources';
import {
  BuildingGroup,
  BuildingGroupRelations,
  BuildingGroupCondition,
} from '../models';
import {BuildingGroupConditionRepository} from './building-group-condition.repository';

export class BuildingGroupRepository extends DefaultCrudRepository<
  BuildingGroup,
  typeof BuildingGroup.prototype.id,
  BuildingGroupRelations
> {
  public readonly buildingGroupCondition: BelongsToAccessor<
    BuildingGroupCondition,
    typeof BuildingGroup.prototype.id
  >;

  constructor(
    @inject(QengDataSource.BINDING_KEY) dataSource: QengDataSource,
    @repository.getter('BuildingGroupConditionRepository')
    protected buildingGroupConditionRepositoryGetter: Getter<BuildingGroupConditionRepository>,
  ) {
    super(BuildingGroup, dataSource);
    this.buildingGroupCondition = this.createBelongsToAccessorFor(
      'buildingGroupCondition',
      buildingGroupConditionRepositoryGetter,
    );
    this.registerInclusionResolver(
      'buildingGroupCondition',
      this.buildingGroupCondition.inclusionResolver,
    );
  }
}
