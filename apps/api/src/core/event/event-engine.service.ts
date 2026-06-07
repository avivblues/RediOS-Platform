import { Injectable } from '@nestjs/common';
import type {
  EventHandlerType,
  EventTriggerDefinition,
  IntegrationExecutionResult,
  RuntimeContext,
  RuntimeDocument,
} from '@redios/shared';
import { IntegrationEngine } from '../integration/integration-engine.service';
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
  integrations: IntegrationExecutionResult[];
  next: 'LEDGER_ENGINE';
}

@Injectable()
export class EventEngine {
  constructor(
    private readonly metadataResolver: MetadataResolver,
    private readonly integrationEngine: IntegrationEngine,
  ) {}

  async publish(
    context: RuntimeContext,
    entityCode: string,
    document: RuntimeDocument,
    runtimeState: RuntimeEventState,
  ): Promise<RuntimeEventPublishResult> {
    const events = await this.metadataResolver.resolveEvents(context, entityCode, runtimeState);
    const integrations: IntegrationExecutionResult[] = [];

    for (const event of events) {
      integrations.push(
        ...(await this.integrationEngine.execute(context, {
          code: event.definition.code,
          type: 'EVENT',
          sourceCode: event.definition.code,
          payload: {
            entityCode,
            document,
            runtimeState,
            event: event.definition,
          },
        })),
      );
    }

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
      integrations,
      next: 'LEDGER_ENGINE',
    };
  }
}
