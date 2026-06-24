import type { AutomationDefinition, AutomationTriggerDefinition, EventDefinition } from '@redios/shared';
import type { EventBusMessage } from '../../event/event.types';

export function automationTriggerMatches(
  trigger: AutomationTriggerDefinition,
  message: EventBusMessage,
): boolean {
  if (trigger.type !== 'EVENT') {
    return false;
  }

  if (trigger.eventCode && trigger.eventCode !== message.eventCode) {
    return false;
  }

  const event = message.payload.event as EventDefinition | undefined;
  if (!event) {
    return false;
  }

  return event.entityCode === message.entityCode;
}

export function scheduleIntervalMinutes(trigger: AutomationTriggerDefinition): number | undefined {
  if (trigger.type !== 'SCHEDULE') {
    return undefined;
  }

  const minutes = Number(trigger.intervalMinutes ?? 0);
  return minutes > 0 ? minutes : undefined;
}

export function automationEntityMatches(automation: AutomationDefinition, entityCode: string): boolean {
  return automation.entityCode === entityCode;
}
