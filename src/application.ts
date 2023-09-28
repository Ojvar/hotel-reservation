/* eslint-disable @typescript-eslint/naming-convention */
import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import KeycloakJson from './keycloak.json';
import {
  KCAuthenticationComponent,
  KEYCLOAK_AGENT_SERVICE_CONFIG,
  KEYCLOAK_DATASOURCE_CONFIG,
  KEYCLOAK_LOCAL_ACL,
  KeycloakComponent,
  KeycloakSequence,
} from './lib-keycloak/src';
import {SENTRY_INTERCEPTOR_CONFIG, SentryComponent} from './lib-sentry/src';
import {MsSqlService} from './services';

export {ApplicationConfig};

export class ProjectsServiceApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    if (!(options.rest?.apiExplorer?.disabled ?? false)) {
      this.configure(RestExplorerBindings.COMPONENT).to({path: '/explorer'});
      this.component(RestExplorerComponent);
    }

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

    this.configSentry();
    this.configKeycloak();
    this.configSqlDB();
  }

  configSqlDB() {
    const {
      SQL_DB_HOST,
      SQL_DB_USER,
      SQL_DB_DOMAIN,
      SQL_DB_DATABASE,
      SQL_DB_PASSWORD,
      SQL_DB_PORT,
    } = process.env;

    this.bind(MsSqlService.BINDING_KEY_CONFIG).to({
      user: SQL_DB_USER,
      domain: SQL_DB_DOMAIN,
      password: SQL_DB_PASSWORD,
      database: SQL_DB_DATABASE,
      server: SQL_DB_HOST,
      port: SQL_DB_PORT ? +SQL_DB_PORT : undefined,
      pool: {max: 10, min: 0, idleTimeoutMillis: 30000},
      options: {
        encrypt: false, // for azure
        trustServerCertificate: true, // change to true for local dev / self-signed certs
      },
    });
  }

  configSentry() {
    const {SENTRY_DSN, SENTRY_SAMPLE_RATE} = process.env;
    this.bind(SENTRY_INTERCEPTOR_CONFIG).to({
      dsn: SENTRY_DSN,
      tracesSampleRate: parseFloat(SENTRY_SAMPLE_RATE ?? '1.0'),
      integrations: integrations =>
        integrations.filter(integration => integration.name !== 'Http'),
    });
    this.component(SentryComponent);
  }

  configKeycloak() {
    const {KEYCLOAK_ALLOWED_LIST, KEYCLOAK_REJECTED_LIST} = process.env;
    const splitRegex = new RegExp(/[,;\t\ ]/, 'g');
    const allowed_roles = (KEYCLOAK_ALLOWED_LIST ?? '')
      .split(splitRegex)
      .filter(x => !!x);
    const rejected_roles = (KEYCLOAK_REJECTED_LIST ?? '')
      .split(splitRegex)
      .filter(x => !!x);

    this.bind(KEYCLOAK_LOCAL_ACL).to({
      rejected_roles,
      allowed_roles,
    });
    this.bind(KEYCLOAK_DATASOURCE_CONFIG).to({
      baseURL: KeycloakJson['auth-server-url'],
    });
    this.bind(KEYCLOAK_AGENT_SERVICE_CONFIG).to({
      realm: KeycloakJson.realm,
      clientId: KeycloakJson.resource,
      clientSecret: KeycloakJson.credentials.secret,
    });

    this.component(KCAuthenticationComponent);
    this.component(KeycloakComponent);
    this.sequence(KeycloakSequence);
  }
}
