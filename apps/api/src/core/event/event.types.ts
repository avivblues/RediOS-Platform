import type { RuntimeContext } from '@redios/shared';

export interface EventBusMessage {
  eventCode: string;
  context: RuntimeContext;
  entityCode: string;
  payload: Record<string, unknown>;
  depth: number;
}

export interface EventHandlerResult {
  subscriber: string;
  status: 'EXECUTED' | 'SKIPPED' | 'FAILED';
  output?: unknown;
  message?: string;
}

export interface EventBusPublishResult {
  eventCode: string;
  handlers: EventHandlerResult[];
}

export interface EventSubscriber {
  readonly name: string;
  supports(message: EventBusMessage): boolean;
  handle(message: EventBusMessage): Promise<EventHandlerResult>;
}
