import { Injectable } from '@nestjs/common';
import { IntegrationEngine } from '../integration/integration-engine.service';
import type { EventBusMessage, EventHandlerResult, EventSubscriber } from './event.types';

@Injectable()
export class IntegrationEventSubscriber implements EventSubscriber {
  readonly name = 'INTEGRATION';

  constructor(private readonly integrationEngine: IntegrationEngine) {}

  supports(): boolean {
    return true;
  }

  async handle(message: EventBusMessage): Promise<EventHandlerResult> {
    const integrations = await this.integrationEngine.execute(message.context, {
      code: message.eventCode,
      type: 'EVENT',
      sourceCode: message.eventCode,
      payload: message.payload,
    });

    return {
      subscriber: this.name,
      status: 'EXECUTED',
      output: integrations,
    };
  }
}
