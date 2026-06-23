import { Injectable } from '@nestjs/common';
import type {
  EventHandlerType,
  EventTriggerDefinition,
  IntegrationExecutionResult,
  RuntimeContext,
  RuntimeDocument,
} from '@redios/shared';
import { MetadataResolver } from '../metadata/metadata-resolver.service';
import { EventBus } from './event.bus';
import type { EventHandlerResult } from './event.types';

export interface RuntimeEventState extends EventTriggerDefinition {}

export interface RuntimeEventHandlerPlan {
  code: string;
  type: EventHandlerType;
  status: 'EXECUTED' | 'READY' | 'FAILED';
  subscriber?: string;
  message?: string;
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
    private readonly eventBus: EventBus,
  ) {}

  async publish(
    context: RuntimeContext,
    entityCode: string,
    document: RuntimeDocument,
    runtimeState: RuntimeEventState,
  ): Promise<RuntimeEventPublishResult> {
    const events = await this.metadataResolver.resolveEvents(context, entityCode, runtimeState);
    const integrations: IntegrationExecutionResult[] = [];
    const plans: RuntimeEventPlan[] = [];

    for (const event of events) {
      const busResult = await this.eventBus.publish({
        eventCode: event.definition.code,
        context,
        entityCode,
        depth: 0,
        payload: {
          entityCode,
          document,
          runtimeState,
          event: event.definition,
        },
      });

      for (const handler of busResult.handlers) {
        if (handler.subscriber === 'INTEGRATION' && Array.isArray(handler.output)) {
          integrations.push(...(handler.output as IntegrationExecutionResult[]));
        }
      }

      plans.push({
        eventCode: event.definition.code,
        handlers: this.mergeHandlerPlans(event.definition.handlers, busResult.handlers),
      });
    }

    return {
      status: 'EVENT_PUBLISHED',
      events: plans,
      integrations,
      next: 'LEDGER_ENGINE',
    };
  }

  private mergeHandlerPlans(
    metadataHandlers: Array<{ code: string; type: EventHandlerType; enabled: boolean }>,
    busHandlers: EventHandlerResult[],
  ): RuntimeEventHandlerPlan[] {
    return metadataHandlers
      .filter((handler) => handler.enabled)
      .map((handler) => {
        const subscriberName = handler.type === 'WORKFLOW'
          ? 'WORKFLOW'
          : handler.type === 'NOTIFICATION'
            ? 'NOTIFICATION'
            : 'INTEGRATION';
        const executed = busHandlers.find((result) => result.subscriber === subscriberName);
        return {
          code: handler.code,
          type: handler.type,
          status: executed?.status === 'EXECUTED' ? 'EXECUTED' : executed?.status === 'FAILED' ? 'FAILED' : 'READY',
          subscriber: executed?.subscriber,
          message: executed?.message,
        };
      });
  }
}
