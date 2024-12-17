/* eslint-disable @typescript-eslint/naming-convention */
import {BindingKey, inject, Provider} from '@loopback/core';
import {getService} from '@loopback/service-proxy';
import {EwalletDataSource} from '../datasources';
import {AnyObject} from '@loopback/repository';

export type TransferResult = {
  transaction_id: string;
  new_balance: number;
  old_balance: number;
  amount: number;
};

export interface Ewallet {
  transfer(
    token: string,
    sourceEWalletUserId: string,
    targetEwalletUserId: string,
    amount: number,
    descrption: string,
    meta: AnyObject,
  ): Promise<TransferResult>;
}

export class EwalletProvider implements Provider<Ewallet> {
  static readonly BINDING_KEY = BindingKey.create<Ewallet>(`services.Ewallet`);

  constructor(
    @inject(EwalletDataSource.BINDING_KEY)
    protected dataSource: EwalletDataSource = new EwalletDataSource(),
  ) {}

  value(): Promise<Ewallet> {
    return getService(this.dataSource);
  }
}
