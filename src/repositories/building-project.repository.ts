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
  EnumStatus,
} from '../models';
import {OfficeRepository} from './office.repository';
import {AddNewJobRequestDTO, JobCandiateResultDTO} from '../dto';
import {AnyObject} from 'loopback-datasource-juggler';
import {ObjectId} from 'bson';

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

  async getProjectByStaffListInfo(
    projectId: string,
    staffStatus: EnumStatus[],
  ): Promise<AnyObject> {
    const aggregate = [
      {$match: {_id: new ObjectId(projectId)}},
      {$unwind: '$staff'},
      {$match: {'staff.status': {$in: staffStatus}}},

      // Lookup over profiles
      {
        $lookup: {
          from: 'profiles',
          localField: 'staff.user_id',
          foreignField: 'user_id',
          as: 'staff.profile',
        },
      },
      // Lookup over basedata
      {
        $lookup: {
          from: 'basedata',
          localField: 'staff.field_id',
          foreignField: '_id',
          as: 'staff.field',
        },
      },
      {
        $set: {
          'staff.field': {$first: '$staff.field.value'},
          'staff.profile': {$first: '$staff.profile'},
        },
      },

      // Group
      {
        $group: {
          _id: '$_id',
          staff: {$push: '$staff'},
          other_fields: {$first: '$$ROOT'},
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ['$other_fields', {id: '$_id', staff: '$staff'}],
          },
        },
      },
    ];
    const pointer = await this.execute(
      BuildingProject.modelName,
      'aggregate',
      aggregate,
    );
    return pointer.next();
  }

  async getAttachmentsList(projectId: string): Promise<AnyObject[]> {
    const aggregate: AnyObject[] = [
      {$match: {_id: new ObjectId(projectId)}},
      {$unwind: '$attachments'},
      {$match: {'attachments.status': 6}},

      {
        $unwind: {
          path: '$attachments.signes',
          preserveNullAndEmptyArrays: true,
        },
      },
      //{$match: {'attachments.signes.status': {$ne: 7}}},

      {
        $lookup: {
          from: 'profiles',
          localField: 'attachments.signes.user_id',
          foreignField: 'user_id',
          as: 'attachments.signes.profile',
        },
      },
      {
        $set: {
          'attachments.signes.profile': {$first: '$attachments.signes.profile'},
        },
      },
      //  { $match: { "attachments.signes.profile.user_id": { $exists: true } } },

      {
        $group: {
          _id: '$attachments.id',
          other_fields: {$first: '$attachments'},
          all_signes: {$push: '$attachments.signes'},
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ['$other_fields', {signes: '$all_signes'}],
          },
        },
      },
    ];

    const pointer = await this.execute(
      BuildingProject.modelName,
      'aggregate',
      aggregate,
    );
    return pointer.toArray();
  }

  async getProjectRawDataById(projectId: string): Promise<AnyObject> {
    const aggregate = [
      {$match: {_id: new ObjectId(projectId)}},

      // Get profiles
      {$unwind: {path: '$lawyers', preserveNullAndEmptyArrays: true}},
      {$unwind: {path: '$ownership.owners', preserveNullAndEmptyArrays: true}},
      {
        $lookup: {
          from: 'profiles',
          localField: 'lawyers.user_id',
          foreignField: 'user_id',
          as: 'lawyers.profile',
        },
      },
      {
        $lookup: {
          from: 'profiles',
          localField: 'ownership.owners.user_id',
          foreignField: 'user_id',
          as: 'ownership.owners.profile',
        },
      },
      {
        $set: {
          'ownership.owners.profile': {$first: '$ownership.owners.profile'},
          'lawyers.profile': {$first: '$lawyers.profile'},
        },
      },

      {
        $group: {
          _id: '$_id',
          owners: {$push: '$ownership.owners'},
          lawyers: {$push: '$lawyers'},
          other_fields: {$first: '$$ROOT'},
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              '$other_fields',
              {ownership: '$ownership', lawyers: '$lawyers', owners: '$owners'},
            ],
          },
        },
      },
      {$set: {'ownership.owners': '$owners', id: '$_id'}},
      {$unset: ['owners']},
    ];
    const pointer = await this.execute(
      BuildingProject.modelName,
      'aggregate',
      aggregate,
      {allowDiskUse: true},
    );
    return pointer.next();
  }
}
