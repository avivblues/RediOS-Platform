import { Injectable } from '@nestjs/common';
import type { EventBusMessage, EventHandlerResult, EventSubscriber } from '../../event/event.types';
import { AutomationEngine } from './automation.engine';

@Injectable()
export class AutomationEventSubscriber implements EventSubscriber {
  readonly name = 'AUTOMATION';

  constructor(private readonly automationEngine: AutomationEngine) {}

  supports(message: EventBusMessage): boolean {
    return message.depth < 4;
  }

  async handle(message: EventBusMessage): Promise<EventHandlerResult> {
    const document = message.payload.document as { id?: string; data?: Record<string, unknown>; status?: string } | undefined;
    const runtimeDocument = document?.id
      ? {
          id: document.id,
          tenantId: message.context.tenantId,
          domainCode: message.context.domainCode,
          applicationCode: message.context.applicationCode,
          entityCode: message.entityCode,
          data: document.data ?? {},
          metadataVersion: 1,
          createdBy: message.context.userId ?? 'system',
          status: document.status,
        }
      : undefined;

    const results = await this.automationEngine.runForEvent(
      message.context,
      message.entityCode,
      message.eventCode,
      runtimeDocument,
    );

    const executed = results.filter((result) => result.status === 'EXECUTED');

    return {
      subscriber: this.name,
      status: executed.length > 0 ? 'EXECUTED' : 'SKIPPED',
      output: results,
      message: executed.length > 0 ? undefined : 'No matching automations.',
    };
  }
}
