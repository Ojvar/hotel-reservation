/* eslint-disable @typescript-eslint/naming-convention */
import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {QengDataSource} from '../datasources';
import {Profile, ProfileRelations} from '../models';
import {HttpErrors} from '@loopback/rest';

export class ProfileRepository extends DefaultCrudRepository<
  Profile,
  typeof Profile.prototype.id,
  ProfileRelations
> {
  constructor(@inject(QengDataSource.BINDING_KEY) dataSource: QengDataSource) {
    super(Profile, dataSource);
  }

  async findByNIdOrFail(nId: string): Promise<Profile> {
    const profile = await this.findOne({where: {n_in: nId}});
    if (!profile) {
      throw new HttpErrors.NotFound('Profile not found');
    }
    return profile;
  }
}
