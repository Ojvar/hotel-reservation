import {injectable, BindingScope, BindingKey} from '@loopback/core';
import {Filter, repository} from '@loopback/repository';
import {DiscountRepository} from '../repositories/discount.repository';
import {
  DiscountDTO,
  DiscountFilter,
  DiscountsDTO,
  NewDiscountDTO,
} from '../dto';
import {adjustMin, adjustRange} from '../helpers';

@injectable({scope: BindingScope.APPLICATION})
export class DiscountService {
  static readonly BINDING_KEY = BindingKey.create<DiscountService>(
    `services.${DiscountService.name}`,
  );

  constructor(
    @repository(DiscountRepository) private discountRepo: DiscountRepository,
  ) {}

  async getDiscounts(
    filter: Filter<DiscountFilter> = {},
  ): Promise<DiscountsDTO> {
    const result = await this.discountRepo.find({
      where: filter.where as object,
      limit: adjustRange(filter.limit, 0, 100),
      skip: adjustMin(filter.skip),
      offset: adjustMin(filter.offset),
      fields: undefined,
      include: undefined,
    });
    return result.map(DiscountDTO.fromModel);
  }

  async getDiscount(id: string): Promise<DiscountDTO> {
    const discount = await this.discountRepo.findById(id);
    return DiscountDTO.fromModel(discount);
  }

  async getDiscountByCode(code: string): Promise<DiscountDTO> {
    const discount = await this.discountRepo.findByCodeOrFail(code);
    return DiscountDTO.fromModel(discount);
  }

  async removeDiscount(operatorId: string, id: string): Promise<void> {
    const discount = await this.discountRepo.findActiveByIdOrFail(id);
    discount.markAsRemoved(operatorId);
    await this.discountRepo.update(discount);
  }

  async createDiscount(
    operatorId: string,
    data: NewDiscountDTO,
  ): Promise<DiscountDTO> {
    const discount = await this.discountRepo.create(data.toModel(operatorId));
    return DiscountDTO.fromModel(discount);
  }

  async editDiscount(
    operatorId: string,
    discountId: string,
    data: NewDiscountDTO,
  ): Promise<DiscountDTO> {
    const discount = await this.discountRepo.findActiveByIdOrFail(discountId);
    discount.update(operatorId, data.toModel(operatorId));
    await this.discountRepo.update(discount);
    return DiscountDTO.fromModel(discount);
  }
}
