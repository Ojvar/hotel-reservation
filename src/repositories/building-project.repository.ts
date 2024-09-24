/* eslint-disable @typescript-eslint/naming-convention */
import {Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  DefaultCrudRepository,
  repository,
} from '@loopback/repository';
import {QengDataSource} from '../datasources';
import {
  BuildingProject,
  BuildingProjectJobResult,
  ModifyStamp,
  Office,
  BuildingProjectRelations,
} from '../models';
import {OfficeRepository} from './office.repository';
import {AddNewJobRequestDTO, JobCandiateResultDTO} from '../dto';

export class BuildingProjectRepository extends DefaultCrudRepository<
  BuildingProject,
  typeof BuildingProject.prototype.id,
  BuildingProjectRelations
> {
  public readonly office: BelongsToAccessor<
    Office,
    typeof BuildingProject.prototype.id
  >;

  constructor(
    @inject(QengDataSource.BINDING_KEY) dataSource: QengDataSource,
    @repository.getter(OfficeRepository.name)
    protected officeRepositoryGetter: Getter<OfficeRepository>,
  ) {
    super(BuildingProject, dataSource);
    this.office = this.createBelongsToAccessorFor(
      'office',
      officeRepositoryGetter,
    );
    this.registerInclusionResolver('office', this.office.inclusionResolver);
  }

  async updateJobData(
    userId: string,
    data: JobCandiateResultDTO,
  ): Promise<void> {
    const project = await this.findById(data.job.meta.id);
    const now = new ModifyStamp({by: userId});
    project.updateJobOrFail(
      userId,
      data.job.id,
      new BuildingProjectJobResult({
        created: now,
        updated: now,
        published_at: data.published_at,
        job_id: data.job.id,
        job_status: data.job.status,
        schedule_error: data.schedule.result.meta.error,
        selected_users: data.schedule.result.meta.data?.users,
        schedule_id: data.schedule.id,
        schedule_status: data.schedule.status,
        schedule_created_at: data.schedule.result.created_at,
      }),
    );
    await this.update(project);
  }

  async addNewJob(
    userId: string,
    projectId: string,
    data: AddNewJobRequestDTO,
  ): Promise<void> {
    const project = await this.findById(projectId);
    project.addNewJob(userId, data.job_id, data.invoice_id);
    await this.update(project);
  }
}
