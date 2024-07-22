import {Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  DefaultCrudRepository,
  repository,
} from '@loopback/repository';
import {QengDataSource} from '../datasources';
import {BuildingProject, Office, ProjectRelations} from '../models';
import {OfficeRepository} from './office.repository';

export class BuildingProjectRepository extends DefaultCrudRepository<
  BuildingProject,
  typeof BuildingProject.prototype.id,
  ProjectRelations
> {
  public readonly office: BelongsToAccessor<
    Office,
    typeof BuildingProject.prototype.id
  >;

  constructor(
    @inject(QengDataSource.BINDING_KEY) dataSource: QengDataSource,
    @repository.getter('OfficeRepository')
    protected officeRepositoryGetter: Getter<OfficeRepository>,
  ) {
    super(BuildingProject, dataSource);
    this.office = this.createBelongsToAccessorFor(
      'office',
      officeRepositoryGetter,
    );
    this.registerInclusionResolver('office', this.office.inclusionResolver);
  }
}
