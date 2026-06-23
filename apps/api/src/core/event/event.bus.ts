import { Injectable, Logger } from '@nestjs/common';
import type { EventBusMessage, EventBusPublishResult, EventHandlerResult, EventSubscriber } from './event.types';

@Injectable()
export class EventBus {
  private readonly logger = new Logger(EventBus.name);
  private readonly subscribers: EventSubscriber[] = [];
  private readonly maxDepth = 5;

  register(subscriber: EventSubscriber): void {
    this.subscribers.push(subscriber);
  }

  async publish(message: EventBusMessage): Promise<EventBusPublishResult> {
    if (message.depth > this.maxDepth) {
      this.logger.warn(`Event depth exceeded for ${message.eventCode}`);
      return {
        eventCode: message.eventCode,
        handlers: [{
          subscriber: 'EVENT_BUS',
          status: 'FAILED',
          message: 'Maximum event depth exceeded.',
        }],
      };
    }

    const handlers: EventHandlerResult[] = [];

    for (const subscriber of this.subscribers) {
      if (!subscriber.supports(message)) {
        continue;
      }

      try {
        handlers.push(await subscriber.handle(message));
      } catch (error) {
        handlers.push({
          subscriber: subscriber.name,
          status: 'FAILED',
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return {
      eventCode: message.eventCode,
      handlers,
    };
  }
}
