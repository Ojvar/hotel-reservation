import dotenv from 'dotenv';
import fs, {readFileSync} from 'fs';
import path from 'path';
import {
  ProjectsServiceApplication,
  ProjectsServiceApplicationConfig,
} from './application';

export * from './application';

export async function main(options: ProjectsServiceApplicationConfig) {
  const app = new ProjectsServiceApplication(options);
  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  console.log(`Try ${url}/ping`);

  return app;
}

export function loadEnv(envFile: string) {
  envFile = path.resolve(envFile);
  if (!fs.existsSync(envFile)) {
    console.warn('Env file not found! ', envFile);
    return;
  }
  const envData = dotenv.parse(fs.readFileSync(envFile));
  for (const data in envData) {
    process.env[data] = envData[data];
  }
}

export function getApplicationConfig(
  envFile?: string,
): ProjectsServiceApplicationConfig {
  const isProduction = process.env.NODE_ENV === 'production';
  const isHttp = 'false' === (process.env.HTTPS ?? 'false').toLowerCase();

  loadEnv(envFile ?? (isProduction ? '.env' : '.env.dev'));

  // Run the application
  return {
    rest: {
      expressSettings: {
        'x-powered-by': !isProduction,
        env: process.env.NODE_ENV ?? 'production',
      },
      apiExplorer: {
        disabled: isProduction,
      },
      port: +(process.env.PORT ?? 3000),
      host: process.env.HOST,
      basePath: process.env.BASE_PATH ?? '',
      ...(isHttp
        ? {}
        : {
            protocol: 'https',
            key: process.env.SSL_KEY
              ? readFileSync(path.resolve(process.env.SSL_KEY))
              : '',
            cert: process.env.SSL_CERT
              ? readFileSync(path.resolve(process.env.SSL_CERT))
              : '',
          }),
      // The `gracePeriodForClose` provides a graceful close for http/https
      // servers with keep-alive clients. The default value is `Infinity`
      // (don't force-close). If you want to immediately destroy all sockets
      // upon stop, set its value to `0`.
      // See https://www.npmjs.com/package/stoppable
      gracePeriodForClose: 5000, // 5 seconds
      openApiSpec: {
        // useful when used with OpenAPI-to-GraphQL to locate your application
        setServersFromRequest: true,
      },
    },
    sentry: {
      dsn: process.env.SENTRY_DSN,
      sampleRate: parseFloat(process.env.SENTRY_SAMPLE_RATE ?? '0.3'),
    },
    keycloak: {
      allowedList: process.env.KEYCLOAK_ALLOWED_LIST,
      rejectedList: process.env.KEYCLOAK_REJECTED_LIST,
    },
    sqlDB: {
      sqlDbHost: process.env.SQL_DB_HOST,
      sqlDbUser: process.env.SQL_DB_USER,
      sqlDbDomain: process.env.SQL_DB_DOMAIN,
      sqlDbDatabase: process.env.SQL_DB_DATABASE,
      sqlDbPassword: process.env.SQL_DB_PASSWORD,
      sqlDbPort: process.env.SQL_DB_PORT,
    },
  };
}

if (require.main === module) {
  main(getApplicationConfig()).catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}
