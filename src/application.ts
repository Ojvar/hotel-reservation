/* eslint-disable @typescript-eslint/naming-convention */
import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import KeycloakJson from './keycloak.json';
import {
  KCAuthenticationComponent,
  KEYCLOAK_LOCAL_ACL,
  KeycloakAgentService,
  KeycloakComponent,
  KeycloakDataSource,
  KeycloakSequence,
} from './lib-keycloak/src';
import {SENTRY_INTERCEPTOR_CONFIG, SentryComponent} from './lib-sentry/src';
import {MsSqlService} from './services';
import {config as SqlConfig} from 'mssql';
import {
  RedisClientOptions,
  RedisComponent,
  RedisService,
} from './lib-redis/src';
import {
  ConsumersBooter,
  QueueComponent,
  RabbitmqBindings,
  RabbitmqComponent,
  RabbitmqComponentConfig,
} from './loopback-rabbitmq/src';
import {
  AuthDataSource,
  AuthDataSourceConfig,
  ProfileDataSource,
  ProfileDataSourceConfig,
  QengDataSource,
  QengDataSourceConfig,
} from './datasources';

export {ApplicationConfig};

export type ProjectsServiceApplicationConfig = ApplicationConfig & {
  sentry: {
    dsn: string;
    sampleRate?: number;
  };
  keycloak: {
    allowedList: string;
    rejectedList: string;
  };
  qengDataSourceConfig: QengDataSourceConfig;
  sqlDbConfig: SqlConfig;
  redisConfig: RedisClientOptions;
  rabbitmqConfig: RabbitmqComponentConfig;
  pofileDataSourceConfig: ProfileDataSourceConfig;
  authDataSourceConfig: AuthDataSourceConfig;
};

export class ProjectsServiceApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ProjectsServiceApplicationConfig) {
    super(options);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({path: '/explorer'});
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
    this.configApp(options);
  }

  configApp(options: ProjectsServiceApplicationConfig) {
    // Sentry
    this.component(SentryComponent);
    this.bind(SENTRY_INTERCEPTOR_CONFIG).to({
      dsn: options.sentry.dsn,
      tracesSampleRate: options.sentry.sampleRate ?? 0.3,
      integrations: integrations =>
        integrations.filter(integration => integration.name !== 'Http'),
    });

    // Keycloak
    const splitRegex = new RegExp(/[,;\t\ ]/, 'g');
    this.bind(KEYCLOAK_LOCAL_ACL).to({
      rejected_roles: options.keycloak.rejectedList
        .split(splitRegex)
        .filter(x => !!x),
      allowed_roles: options.keycloak.allowedList
        .split(splitRegex)
        .filter(x => !!x),
    });
    this.bind(KeycloakDataSource.CONFIG_BINDING_KEY).to({
      baseURL: KeycloakJson['auth-server-url'],
    });
    this.bind(KeycloakAgentService.CONFIG_BINDING_KEY).to({
      realm: KeycloakJson.realm,
      clientId: KeycloakJson.resource,
      clientSecret: KeycloakJson.credentials.secret,
    });
    this.component(KCAuthenticationComponent);
    this.component(KeycloakComponent);
    this.sequence(KeycloakSequence);

    // Datasources
    this.bind(MsSqlService.BINDING_KEY_CONFIG).to(options.sqlDbConfig);
    this.bind(QengDataSource.CONFIG_BINDING_KEY).to(
      options.qengDataSourceConfig,
    );

    this.bind(ProfileDataSource.CONFIG_BINDING_KEY).to(
      options.pofileDataSourceConfig,
    );
    this.bind(AuthDataSource.CONFIG_BINDING_KEY).to(
      options.authDataSourceConfig,
    );

    // Redis
    this.component(RedisComponent);
    this.bind(RedisService.CONFIG_BINDING_KEY).to(options.redisConfig);

    // RabbitMQ
    this.bind(RabbitmqBindings.CONFIG).to(options.rabbitmqConfig);
    this.component(RabbitmqComponent);
    this.booters(ConsumersBooter);
    this.component(QueueComponent);
  }
}
