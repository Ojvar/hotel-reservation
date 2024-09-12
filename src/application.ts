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
import {SentryComponent, SentryInterceptor} from './lib-sentry/src';
import {
  MsSqlService,
  ProjectManagementService,
  ProjectManagementServiceConfig,
} from './services';
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
  RegistrationOrgDataSource,
  RegistrationOrgDataSourceConfig,
} from './datasources';
import * as sentry from '@sentry/node';
import {
  FileServiceComponent,
  FileServiceDataSource,
} from './lib-file-service/src';
import {
  PushNotificationDataSource,
  PushNotificationDataSourceConfig,
  PushNotificationServiceComponent,
} from './lib-push-notification-service/src';

export {ApplicationConfig};

export type ProjectsServiceApplicationConfig = ApplicationConfig & {
  sentry: sentry.NodeOptions | undefined;
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
  fileServiceBaseURL: string;
  pushNotificationDataSourceConfig: PushNotificationDataSourceConfig;
  projectManagementServiceConfig: ProjectManagementServiceConfig;
  registrationOrgDataSourceConfig: RegistrationOrgDataSourceConfig;
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
      consumers: {
        dirs: ['consumers'],
        extensions: ['.consumer.js'],
        nested: true,
      },
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
    this.bind(SentryInterceptor.CONFIG_BINDING_KEY).to({...options.sentry});

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

    // Push Notification
    this.component(PushNotificationServiceComponent);
    this.bind(PushNotificationDataSource.CONFIG_BINDING_KEY).to(
      options.pushNotificationDataSourceConfig,
    );

    // Redis
    this.component(RedisComponent);
    this.bind(RedisService.CONFIG_BINDING_KEY).to(options.redisConfig);

    // RabbitMQ
    this.configure(RabbitmqBindings.COMPONENT).to(options.rabbitmqConfig);
    this.component(RabbitmqComponent);
    this.booters(ConsumersBooter);
    this.component(QueueComponent);

    // FileService
    this.bind(FileServiceDataSource.CONFIG_BINDING_KEY).to({
      baseURL: options.fileServiceBaseURL,
    });
    this.component(FileServiceComponent);

    // Registration Org datasource
    this.bind(RegistrationOrgDataSource.CONFIG_BINDING_KEY).to(
      options.registrationOrgDataSourceConfig,
    );

    // Internal Services
    this.bind(ProjectManagementService.CONFIG_BINDING_KEY).to(
      options.projectManagementServiceConfig,
    );
  }
}
