import {AnyObject, Filter} from '@loopback/repository';
import {get, param} from '@loopback/rest';
import { HotelFilter } from '../dto';

const BASE_ADDR = '/hotels';
const tags = ['Hotel'];

export class HotelController {
  constructor() {}

  @get(`${BASE_ADDR}`, {
    tags,
    summary: 'Get hotels list',
    description: 'Get hotels list',
    responses: {
      200: {
        content: {
          'application/json': {
            schema: {},
          },
        },
      },
    },
  })
  async getHotelList(
    @param.filter(HotelFilter) filter: Filter<HotelFilter> = {},
  ): Promise<AnyObject[]> {
    return [];
  }
}
