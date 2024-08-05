/* eslint-disable @typescript-eslint/naming-convention */
import {BindingKey, BindingScope, inject, injectable} from '@loopback/core';

import {
  EnumTargetType,
  PushNotificationAgent,
  PushNotificationAgentProvider,
} from '../lib-push-notification-service/src';
import {KeycloakAgentService} from '../lib-keycloak/src';

@injectable({scope: BindingScope.APPLICATION})
export class PushNotificationAgentService {
  static BINDING_KEY = BindingKey.create<PushNotificationAgentService>(
    `services.${PushNotificationAgentService.name}`,
  );

  constructor(
    @inject(KeycloakAgentService.BINDING_KEY)
    private keycloakAgent: KeycloakAgentService,
    @inject(PushNotificationAgentProvider.BINDING_KEY)
    private pushNotifAgent: PushNotificationAgent,
  ) {}

  async publish(
    targetType: EnumTargetType,
    title: string,
    body: string,
    targets: string[],
    tags: string[] = [],
    image: string = '',
    icon: string = '',
    link: string = '',
    saveMessage = true,
  ): Promise<void> {
    const {access_token} = await this.keycloakAgent.getAdminToken();
    await this.pushNotifAgent.publish(
      access_token,
      title,
      body,
      targetType,
      tags,
      targets,
      saveMessage,
      icon,
      image,
      link,
    );
  }
}
