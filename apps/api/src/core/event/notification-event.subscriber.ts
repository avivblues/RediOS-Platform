import { Injectable } from '@nestjs/common';
import type { EventDefinition } from '@redios/shared';
import { NotificationCenterService } from '../experience/notification/notification-center.service';
import type { EventBusMessage, EventHandlerResult, EventSubscriber } from './event.types';

@Injectable()
export class NotificationEventSubscriber implements EventSubscriber {
  readonly name = 'NOTIFICATION';

  constructor(private readonly notificationCenter: NotificationCenterService) {}

  supports(message: EventBusMessage): boolean {
    const event = message.payload.event as EventDefinition | undefined;
    return Boolean(event?.handlers?.some((handler) => handler.enabled && handler.type === 'NOTIFICATION'));
  }

  async handle(message: EventBusMessage): Promise<EventHandlerResult> {
    const event = message.payload.event as EventDefinition;
    const handlers = event.handlers.filter((handler) => handler.enabled && handler.type === 'NOTIFICATION');
    const results: Array<Record<string, unknown>> = [];

    for (const handler of handlers) {
      const targetRole = String(handler.config.targetRole ?? 'STAFF');
      const messageText = String(handler.config.message ?? `Event ${event.code} published.`);

      const saved = await this.notificationCenter.record({
        tenantId: message.context.tenantId,
        userId: message.context.userId,
        targetRole,
        title: event.code,
        message: messageText,
        eventCode: event.code,
      });

      results.push({
        handler: handler.code,
        status: 'EXECUTED',
        notificationId: saved.id,
        targetRole,
      });
    }

    return {
      subscriber: this.name,
      status: 'EXECUTED',
      output: results,
    };
  }
}
