export type EventHandlerType = 'NOTIFICATION' | 'WEBHOOK' | 'AUDIT_LOG' | 'QUEUE';

export interface EventTriggerDefinition {
  actionCode?: string;
  workflowState?: string;
  processCode?: string;
}

export interface EventHandlerDefinition {
  code: string;
  type: EventHandlerType;
  enabled: boolean;
  config: Record<string, unknown>;
}

export interface EventDefinition {
  code: string;
  entityCode: string;
  trigger: EventTriggerDefinition;
  handlers: EventHandlerDefinition[];
  enabled: boolean;
}
