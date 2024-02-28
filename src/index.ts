import dotenv from 'dotenv';
import fs from 'fs';
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
      apiExplorer: {disabled: isProduction},
      port: +(process.env.PORT ?? 3000),
      host: process.env.HOST,
      basePath: process.env.BASE_PATH ?? '',
      ...(isHttp
        ? {}
        : {
            protocol: 'https',
            key: process.env.SSL_KEY
              ? fs.readFileSync(path.resolve(process.env.SSL_KEY))
              : '',
            cert: process.env.SSL_CERT
              ? fs.readFileSync(path.resolve(process.env.SSL_CERT))
              : '',
          }),
      gracePeriodForClose: 5000,
      openApiSpec: {setServersFromRequest: true},
    },
    sentry: {
      dsn: process.env.SENTRY_DSN,
      sampleRate: parseFloat(process.env.SENTRY_SAMPLE_RATE ?? '0.3'),
    },
    keycloak: {
      allowedList: process.env.KEYCLOAK_ALLOWED_LIST,
      rejectedList: process.env.KEYCLOAK_REJECTED_LIST,
    },
    sqlDbConfig: {
      user: process.env.SQL_DB_USER,
      domain: process.env.SQL_DB_DOMAIN,
      password: process.env.SQL_DB_PASSWORD,
      database: process.env.SQL_DB_DATABASE,
      server: process.env.SQL_DB_HOST,
      port: process.env.SQL_DB_PORT ? +process.env.SQL_DB_PORT : undefined,
      pool: {max: 10, min: 0, idleTimeoutMillis: 30000},
      options: {
        encrypt: false, // For azure
        trustServerCertificate: true, // Change to true for local dev / self-signed certs
      },
    },
  };
}

if (require.main === module) {
  main(getApplicationConfig()).catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}
