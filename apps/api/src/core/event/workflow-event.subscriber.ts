import { Injectable } from '@nestjs/common';
import type { EventDefinition, RuntimeDocument } from '@redios/shared';
import { StorageEngine } from '../storage/storage.engine';
import { WorkflowEngine } from '../workflow/workflow-engine.service';
import type { EventBusMessage, EventHandlerResult, EventSubscriber } from './event.types';

@Injectable()
export class WorkflowEventSubscriber implements EventSubscriber {
  readonly name = 'WORKFLOW';

  constructor(
    private readonly workflowEngine: WorkflowEngine,
    private readonly storageEngine: StorageEngine,
  ) {}

  supports(message: EventBusMessage): boolean {
    const event = message.payload.event as EventDefinition | undefined;
    return Boolean(event?.handlers?.some((handler) => handler.enabled && handler.type === 'WORKFLOW'));
  }

  async handle(message: EventBusMessage): Promise<EventHandlerResult> {
    const event = message.payload.event as EventDefinition;
    const document = message.payload.document as RuntimeDocument | undefined;
    const handlers = event.handlers.filter((handler) => handler.enabled && handler.type === 'WORKFLOW');
    const results: Array<Record<string, unknown>> = [];

    for (const handler of handlers) {
      const actionCode = String(handler.config.actionCode ?? '');

      if (!actionCode) {
        results.push({
          handler: handler.code,
          status: 'SKIPPED',
          message: 'Missing actionCode in workflow handler config.',
        });
        continue;
      }

      if (!document?.id) {
        results.push({
          handler: handler.code,
          status: 'READY',
          actionCode,
          message: 'Workflow trigger planned; no document payload available.',
        });
        continue;
      }

      const currentStatus = document.status ? String(document.status) : undefined;

      try {
        const transition = await this.workflowEngine.transition(
          message.context,
          message.entityCode,
          currentStatus,
          actionCode,
        );

        if (transition.transitioned) {
          await this.storageEngine.update(message.context, message.entityCode, document.id, {
            status: transition.to,
          });
        }

        results.push({
          handler: handler.code,
          status: transition.transitioned ? 'EXECUTED' : 'READY',
          transition,
        });
      } catch (error) {
        results.push({
          handler: handler.code,
          status: 'FAILED',
          message: error instanceof Error ? error.message : 'Workflow transition failed.',
        });
      }
    }

    const failed = results.some((result) => result.status === 'FAILED');

    return {
      subscriber: this.name,
      status: failed ? 'FAILED' : 'EXECUTED',
      output: results,
    };
  }
}
