import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {QengDataSource} from '../datasources';
import {Discount, DiscountRelations, EnumStatus} from '../models';
import {HttpErrors} from '@loopback/rest';

export class DiscountRepository extends DefaultCrudRepository<
  Discount,
  typeof Discount.prototype.id,
  DiscountRelations
> {
  constructor(@inject(QengDataSource.BINDING_KEY) dataSource: QengDataSource) {
    super(Discount, dataSource);
  }

  async findByCodeOrFail(code: string): Promise<Discount> {
    const discount = await this.findOne({
      where: {status: EnumStatus.ACTIVE, code},
    });
    if (!discount) {
      throw new HttpErrors.NotFound(`Discount not found, Code: ${code}`);
    }
    return discount;
  }

  async findActiveByIdOrFail(id: string): Promise<Discount> {
    const discount = await this.findOne({
      where: {status: EnumStatus.ACTIVE, id},
    });
    if (!discount) {
      throw new HttpErrors.NotFound(`Discount not found, Id: ${id}`);
    }
    return discount;
  }
}
