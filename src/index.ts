import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import {
  ProjectsServiceApplication,
  ProjectsServiceApplicationConfig,
} from './application';
//import {nodeProfilingIntegration} from '@sentry/profiling-node';

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
    //sentry: {
    //  integrations: [nodeProfilingIntegration()],
    //  dsn: process.env.SENTRY_DSN,
    //  sampleRate: parseFloat(process.env.SENTRY_SAMPLE_RATE ?? '0.3'),
    //  profilesSampleRate: parseFloat(
    //    process.env.SENTRY_PROFILES_SAMPLE_RATE ?? '0.3',
    //  ),
    //},
    keycloak: {
      allowedList: process.env.KEYCLOAK_ALLOWED_LIST,
      rejectedList: process.env.KEYCLOAK_REJECTED_LIST,
    },
    qengDataSourceConfig: {
      user: process.env.QENG_DB_USER,
      url: process.env.QENG_DB_URL,
      host: process.env.QENG_DB_HOST,
      port: +process.env.QENG_DB_PORT,
      password: process.env.QENG_DB_PASSWORD,
      database: process.env.QENG_DB_DATABASE,
    },
    reservationServiceConfig: {
      targetWalletId: process.env.TARGET_EWALLET_USER_ID,
    },
    ewalletDataSourceConfig: {baseURL: process.env.EWALLET_DS_BASE_URL},
  };
}

if (require.main === module) {
  main(getApplicationConfig()).catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}
