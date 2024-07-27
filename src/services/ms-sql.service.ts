import {
  BindingKey,
  BindingScope,
  inject,
  injectable,
  lifeCycleObserver,
} from '@loopback/core';
import sql, {config, ConnectionPool, IResult} from 'mssql';

@lifeCycleObserver('service')
@injectable({scope: BindingScope.APPLICATION})
export class MsSqlService {
  static BINDING_KEY = BindingKey.create<MsSqlService>(
    `services.${MsSqlService.name}`,
  );
  static BINDING_KEY_CONFIG = BindingKey.create<string | config>(
    `services.config.${MsSqlService.name}`,
  );

  private sql: ConnectionPool;

  constructor(
    @inject(MsSqlService.BINDING_KEY_CONFIG, {
      optional: true,
    })
    private configs: string | config,
  ) {}

  runQueryWithResult<T>(query: string): Promise<IResult<T>> {
    return this.sql.query<T>(query);
  }

  async start(): Promise<void> {
    this.sql = await sql.connect(this.configs);
    this.sql.on('error', error => {
      console.error(error);
      process.exit(-1);
    });
  }

  stop(): Promise<void> {
    return this.sql.close();
  }
}
