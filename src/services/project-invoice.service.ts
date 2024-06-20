import {BindingKey, BindingScope, injectable} from '@loopback/core';

@injectable({scope: BindingScope.APPLICATION})
export class ProjectInvoiceService {
  static BINDING_KEY = BindingKey.create<ProjectInvoiceService>(
    `services.${ProjectInvoiceService.name}`,
  );

  constructor() {}
}
