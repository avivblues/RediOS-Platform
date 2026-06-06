import { Injectable } from '@nestjs/common';
import type { EventHandlerType, EventTriggerDefinition, RuntimeContext, RuntimeDocument } from '@redios/shared';
import { MetadataResolver } from '../metadata/metadata-resolver.service';

export interface RuntimeEventState extends EventTriggerDefinition {}

export interface RuntimeEventHandlerPlan {
  code: string;
  type: EventHandlerType;
  status: 'READY';
}

export interface RuntimeEventPlan {
  eventCode: string;
  handlers: RuntimeEventHandlerPlan[];
}

export interface RuntimeEventPublishResult {
  status: 'EVENT_PUBLISHED';
  events: RuntimeEventPlan[];
  next: 'LEDGER_ENGINE';
}

@Injectable()
export class EventEngine {
  constructor(private readonly metadataResolver: MetadataResolver) {}

  async publish(
    context: RuntimeContext,
    entityCode: string,
    _document: RuntimeDocument,
    runtimeState: RuntimeEventState,
  ): Promise<RuntimeEventPublishResult> {
    const events = await this.metadataResolver.resolveEvents(context, entityCode, runtimeState);

    return {
      status: 'EVENT_PUBLISHED',
      events: events.map((event) => ({
        eventCode: event.definition.code,
        handlers: event.definition.handlers
          .filter((handler) => handler.enabled)
          .map((handler) => ({
            code: handler.code,
            type: handler.type,
            status: 'READY',
          })),
      })),
      next: 'LEDGER_ENGINE',
    };
  }
}
