import {inject} from '@loopback/context';
import {Filter} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {
  DiscountDTO,
  DiscountFilter,
  DiscountsDTO,
  NewDiscountDTO,
} from '../dto';
import {KeycloakSecurity, KeycloakSecurityProvider} from '../lib-keycloak/src';
import {DiscountService} from '../services';

const BASE_ADDR = '/discounts/';
const tags = ['Discounts'];

export class DiscountController {
  constructor(
    @inject(DiscountService.BINDING_KEY)
    private discountService: DiscountService,
    @inject(KeycloakSecurityProvider.BINDING_KEY)
    private keycloakSecurity: KeycloakSecurity,
  ) {}

  @get(`${BASE_ADDR}`, {
    tags,
    summary: 'Get discounts list',
    description: 'Get discounts list',
    responses: {
      200: {
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(DiscountDTO)},
          },
        },
      },
    },
  })
  getDiscounts(
    @param.filter(DiscountFilter) filter: Filter<DiscountFilter> = {},
  ): Promise<DiscountsDTO> {
    return this.discountService.getDiscounts(filter);
  }

  @get(`${BASE_ADDR}/{discount_id}`, {
    tags,
    summary: 'Get discount by id',
    description: 'Get discount by id',
    responses: {
      200: {
        content: {'application/json': {schema: getModelSchemaRef(DiscountDTO)}},
      },
    },
  })
  getDiscountById(
    @param.path.string('discount_id') discountId: string,
  ): Promise<DiscountDTO> {
    return this.discountService.getDiscount(discountId);
  }

  @get(`${BASE_ADDR}/find/{code}`, {
    tags,
    summary: 'Get discount by code',
    description: 'Get discount by code',
    responses: {
      200: {
        content: {'application/json': {schema: getModelSchemaRef(DiscountDTO)}},
      },
    },
  })
  getDiscountByCode(
    @param.path.string('code') code: string,
  ): Promise<DiscountDTO> {
    return this.discountService.getDiscountByCode(code);
  }

  @del(`${BASE_ADDR}/{discount_id}`, {
    tags,
    summary: 'Remove discount by id',
    description: 'Remove discount by id',
    responses: {204: {}},
  })
  async removeDiscount(
    @param.path.string('discount_id') discountId: string,
  ): Promise<void> {
    const {sub: operatorId} = await this.keycloakSecurity.getUserInfo();
    return this.discountService.removeDiscount(operatorId, discountId);
  }

  @post(`${BASE_ADDR}`, {
    tags,
    summary: 'Create new discount',
    description: 'Create new discount',
    responses: {
      200: {
        content: {'application/json': {schema: getModelSchemaRef(DiscountDTO)}},
      },
    },
  })
  async createDiscount(
    @requestBody() body: NewDiscountDTO,
  ): Promise<DiscountDTO> {
    const {sub: operatorId} = await this.keycloakSecurity.getUserInfo();
    return this.discountService.createDiscount(
      operatorId,
      new NewDiscountDTO(body),
    );
  }

  @patch(`${BASE_ADDR}/{discount_id}`, {
    tags,
    summary: 'Edit discount',
    description: 'Edit discount',
    responses: {
      200: {
        content: {'application/json': {schema: getModelSchemaRef(DiscountDTO)}},
      },
    },
  })
  async editDiscount(
    @requestBody() body: NewDiscountDTO,
    @param.path.string('discount_id') discountId: string,
  ): Promise<DiscountDTO> {
    const {sub: operatorId} = await this.keycloakSecurity.getUserInfo();
    return this.discountService.editDiscount(
      operatorId,
      discountId,
      new NewDiscountDTO(body),
    );
  }
}
