import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventBus } from './event.bus';
import { EventEngine } from './event-engine.service';
import { HumanTaskEventSubscriber } from './human-task-event.subscriber';
import { IntegrationEventSubscriber } from './integration-event.subscriber';
import { NotificationEventSubscriber } from './notification-event.subscriber';
import { WorkflowEventSubscriber } from './workflow-event.subscriber';

@Injectable()
export class EventSubscriberRegistry implements OnModuleInit {
  constructor(
    private readonly eventBus: EventBus,
    private readonly integrationSubscriber: IntegrationEventSubscriber,
    private readonly workflowSubscriber: WorkflowEventSubscriber,
    private readonly notificationSubscriber: NotificationEventSubscriber,
    private readonly humanTaskSubscriber: HumanTaskEventSubscriber,
  ) {}

  onModuleInit(): void {
    this.eventBus.register(this.integrationSubscriber);
    this.eventBus.register(this.workflowSubscriber);
    this.eventBus.register(this.notificationSubscriber);
    this.eventBus.register(this.humanTaskSubscriber);
  }
}

export const eventBusProviders = [
  EventBus,
  IntegrationEventSubscriber,
  WorkflowEventSubscriber,
  NotificationEventSubscriber,
  HumanTaskEventSubscriber,
  EventSubscriberRegistry,
  EventEngine,
];
