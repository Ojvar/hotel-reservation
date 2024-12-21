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
import {
  EwalletDataSource,
  EwalletDataSourceConfig,
  QengDataSource,
  QengDataSourceConfig,
} from './datasources';
import {ReservationService, ReservationServiceConfig} from './services';
import {
  KCAuthenticationComponent,
  KEYCLOAK_LOCAL_ACL,
  KeycloakAgentService,
  KeycloakComponent,
  KeycloakDataSource,
  KeycloakSequence,
} from './lib-keycloak/src';
import KeycloakJson from './keycloak.json';
//import * as sentry from '@sentry/node';

export {ApplicationConfig};

export type ProjectsServiceApplicationConfig = ApplicationConfig & {
  //sentry: sentry.NodeOptions | undefined;
  keycloak: {
    allowedList: string;
    rejectedList: string;
  };
  reservationServiceConfig: ReservationServiceConfig;
  qengDataSourceConfig: QengDataSourceConfig;
  ewalletDataSourceConfig: EwalletDataSourceConfig;
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
    //// Sentry
    //this.component(SentryComponent);
    //this.bind(SentryInterceptor.CONFIG_BINDING_KEY).to({...options.sentry});

    // Keycloak
    const splitRegex = new RegExp(/[,;\t\ ]/, 'g');
    this.bind(KEYCLOAK_LOCAL_ACL).to({
      rejected_roles: options.keycloak.rejectedList
        .split(splitRegex)
        .filter((x: string) => !!x),
      allowed_roles: options.keycloak.allowedList
        .split(splitRegex)
        .filter((x: string) => !!x),
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

    this.bind(QengDataSource.CONFIG_BINDING_KEY).to(
      options.qengDataSourceConfig,
    );
    this.bind(ReservationService.CONFIG_BINDING_KEY).to(
      options.reservationServiceConfig,
    );
    this.bind(EwalletDataSource.CONFIG_BINDING_KEY).to(
      options.ewalletDataSourceConfig,
    );
  }
}
