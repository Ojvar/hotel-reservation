import {Client, createRestAppClient} from '@loopback/testlab';
import {ProjectsServiceApplication, getApplicationConfig} from '../..';

export async function setupApplication(): Promise<AppWithClient> {
  const app = new ProjectsServiceApplication(getApplicationConfig('.env.test'));
  await app.boot();
  await app.start();
  const client = createRestAppClient(app);
  return {app, client};
}

export interface AppWithClient {
  app: ProjectsServiceApplication;
  client: Client;
}
