import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import {
  ProjectsServiceApplication,
  ProjectsServiceApplicationConfig,
} from './application';
import {RMQ_EXCHANGES} from './helpers';
import {MessageHandlerErrorBehavior} from './loopback-rabbitmq/src';
import {nodeProfilingIntegration} from '@sentry/profiling-node';

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
      integrations: [nodeProfilingIntegration()],
      dsn: process.env.SENTRY_DSN,
      sampleRate: parseFloat(process.env.SENTRY_SAMPLE_RATE ?? '0.3'),
      profilesSampleRate: parseFloat(
        process.env.SENTRY_PROFILES_SAMPLE_RATE ?? '0.3',
      ),
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
    redisConfig: {
      url: process.env.REDIS_URL,
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD,
      name: process.env.REDIS_NAME,
      database: +process.env.REDIS_DATABASE,
      socket: {
        port: +(process.env.REDIS_SOCKET_PORT ?? '6379'),
        host: process.env.REDIS_SOCKET_HOST ?? 'localhost',
      },
    },
    fileServiceBaseURL: process.env.FILE_SERVICE_BASE_URL,
    authDataSourceConfig: {baseURL: process.env.AUTH_SERVICE_BASE_URL},
    pofileDataSourceConfig: {baseURL: process.env.PROFILE_SERVICE_BASE_URL},
    qengDataSourceConfig: {
      user: process.env.QENG_DB_USER,
      url: process.env.QENG_DB_URL,
      host: process.env.QENG_DB_HOST,
      port: +process.env.QENG_DB_PORT,
      password: process.env.QENG_DB_PASSWORD,
      database: process.env.QENG_DB_DATABASE,
    },
    rabbitmqConfig: {
      options: {
        protocol: process.env.RABBITMQ_PROTOCOL,
        hostname: process.env.RABBITMQ_HOST,
        port: +(process.env.RABBITMQ_PORT ?? '5672'),
        username: process.env.RABBITMQ_USER,
        password: process.env.RABBITMQ_PASS,
        vhost: process.env.RABBITMQ_VHOST,
      },
      producer: {idleTimeoutMillis: 10000},
      consumer: {retries: 0, interval: 1500},
      defaultConsumerErrorBehavior: MessageHandlerErrorBehavior.ACK,
      prefetchCount: 1,
      exchanges: [
        {
          name: RMQ_EXCHANGES.JOBS.name,
          type: RMQ_EXCHANGES.JOBS.type,
          options: RMQ_EXCHANGES.JOBS.options,
          queues: [
            {
              queue: RMQ_EXCHANGES.JOBS.queues.JOBS_CANDIDATION_RESULT.name,
              routingKey:
                RMQ_EXCHANGES.JOBS.queues.JOBS_CANDIDATION_RESULT.routingKey,
              queueOptions:
                RMQ_EXCHANGES.JOBS.queues.JOBS_CANDIDATION_RESULT.options,
            },
            {
              queue: RMQ_EXCHANGES.JOBS.queues.JOBS_CANDIDATION_RESULT_MSG.name,
              routingKey:
                RMQ_EXCHANGES.JOBS.queues.JOBS_CANDIDATION_RESULT_MSG
                  .routingKey,
              queueOptions:
                RMQ_EXCHANGES.JOBS.queues.JOBS_CANDIDATION_RESULT_MSG.options,
            },
          ],
        },
        {
          name: RMQ_EXCHANGES.MESSAGE.name,
          type: RMQ_EXCHANGES.MESSAGE.type,
          options: RMQ_EXCHANGES.MESSAGE.options,
          queues: [
            {
              queue: RMQ_EXCHANGES.MESSAGE.queues.SMS.name,
              routingKey: RMQ_EXCHANGES.MESSAGE.queues.SMS.routingKey,
              queueOptions: RMQ_EXCHANGES.MESSAGE.queues.SMS.options,
            },
          ],
        },
      ],
    },
  };
}

if (require.main === module) {
  main(getApplicationConfig()).catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}
