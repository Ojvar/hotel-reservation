import {ProjectsServiceApplication} from '../..';
import {
  Client,
  createRestAppClient,
  givenHttpServerConfig,
} from '@loopback/testlab';
import dotenv from 'dotenv';

export async function setupApplication(): Promise<AppWithClient> {
  dotenv.config();

  const restConfig = givenHttpServerConfig({});
  const app = new ProjectsServiceApplication({rest: restConfig});

  await app.boot();
  await app.start();

  const client = createRestAppClient(app);

  return {app, client};
}

export interface AppWithClient {
  app: ProjectsServiceApplication;
  client: Client;
}
