import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {QengDataSource} from '../datasources';
import {BuildingProject, ProjectRelations} from '../models';

export class BuildingProjectRepository extends DefaultCrudRepository<
  BuildingProject,
  typeof BuildingProject.prototype.id,
  ProjectRelations
> {
  constructor(@inject(QengDataSource.BINDING_KEY) dataSource: QengDataSource) {
    super(BuildingProject, dataSource);
  }
}
