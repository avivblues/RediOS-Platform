import { Injectable } from '@nestjs/common';
import type { EventDefinition } from '@redios/shared';
import type { EventBusMessage, EventHandlerResult, EventSubscriber } from './event.types';
import { HumanTaskEngine } from '../experience/human-task/human-task.engine';

@Injectable()
export class HumanTaskEventSubscriber implements EventSubscriber {
  readonly name = 'HUMAN_TASK';

  constructor(private readonly humanTaskEngine: HumanTaskEngine) {}

  supports(message: EventBusMessage): boolean {
    const event = message.payload.event as EventDefinition | undefined;
    return Boolean(event?.handlers?.some((handler) => handler.enabled && handler.type === 'HUMAN_TASK'));
  }

  async handle(message: EventBusMessage): Promise<EventHandlerResult> {
    const event = message.payload.event as EventDefinition;
    const document = message.payload.document as { id?: string; data?: Record<string, unknown> } | undefined;
    const handlers = event.handlers.filter((handler) => handler.enabled && handler.type === 'HUMAN_TASK');
    const results: Array<Record<string, unknown>> = [];

    for (const handler of handlers) {
      const title = String(handler.config.title ?? `${event.code} approval`);
      const assigneeRoles = Array.isArray(handler.config.assigneeRoles)
        ? handler.config.assigneeRoles.map(String)
        : [String(handler.config.targetRole ?? 'SUPERVISOR')];

      const saved = await this.humanTaskEngine.create({
        tenantId: message.context.tenantId,
        title,
        entityCode: message.entityCode,
        documentId: document?.id,
        actionCode: String(handler.config.actionCode ?? 'APPROVE'),
        processCode: String(handler.config.processCode ?? event.code),
        assigneeRoles,
        priority: String(handler.config.priority ?? 'NORMAL').toUpperCase() === 'HIGH' ? 'HIGH' : 'NORMAL',
        source: 'PROCESS',
      });

      results.push({
        handler: handler.code,
        status: 'EXECUTED',
        humanTaskId: saved.id,
      });
    }

    return {
      subscriber: this.name,
      status: 'EXECUTED',
      output: results,
    };
  }
}
