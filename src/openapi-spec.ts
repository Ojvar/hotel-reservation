import {
  ProjectsServiceApplication,
  ProjectsServiceApplicationConfig,
} from './application';
import {getApplicationConfig} from './index';

/**
 * Export the OpenAPI spec from the application
 */
async function exportOpenApiSpec(): Promise<void> {
  const config: ProjectsServiceApplicationConfig = {
    ...getApplicationConfig(),
    rest: {
      port: +(process.env.PORT ?? 3000),
      host: process.env.HOST ?? 'localhost',
    },
  };
  const outFile = process.argv[2] ?? '';
  const app = new ProjectsServiceApplication(config);
  await app.boot();
  await app.exportOpenApiSpec(outFile);
}

exportOpenApiSpec().catch(err => {
  console.error('Fail to export OpenAPI spec from the application.', err);
  process.exit(1);
});
