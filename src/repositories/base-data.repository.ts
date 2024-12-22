import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {QengDataSource} from '../datasources';
import {BaseData, BaseDataRelations} from '../models';
import {EnumStatus} from '../lib-models/src';
import {HttpErrors} from '@loopback/rest';

export class BaseDataRepository extends DefaultCrudRepository<
  BaseData,
  typeof BaseData.prototype.id,
  BaseDataRelations
> {
  constructor(@inject(QengDataSource.BINDING_KEY) dataSource: QengDataSource) {
    super(BaseData, dataSource);
  }

  async findByCategory(category: string): Promise<BaseData> {
    const data = await this.findOne({
      where: {category, status: EnumStatus.ACTIVE},
    });
    if (!data) {
      throw new HttpErrors.NotFound(`category not found, ${category}`);
    }
    return data;
  }
}
