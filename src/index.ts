import dotenv from 'dotenv';
import {readFileSync} from 'fs';
import {ApplicationConfig, ProjectsServiceApplication} from './application';
import path from 'path';

export * from './application';

export async function main(options: ApplicationConfig = {}) {
  const app = new ProjectsServiceApplication(options);
  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  console.log(`Try ${url}/ping`);

  return app;
}

if (require.main === module) {
  dotenv.config();

  const isProduction = process.env.NODE_ENV === 'production';
  const isHttp = 'false' === (process.env.HTTPS ?? 'false').toLowerCase();

  // Run the application
  const config = {
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
  };
  main(config).catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}
