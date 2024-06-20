import {get} from '@loopback/rest';

const BASE_ADDR = '/project-management/invoice/';
const tags = ['ProjectManagement.Invoice'];

export class ProjectInvoiceController {
  constructor() {}

  @get(`${BASE_ADDR}`, {
    tags,
    summary: 'Test',
    description: 'Test',
    responses: {},
  })
  async test(): Promise<void> {}
}
