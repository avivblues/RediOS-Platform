export type AutomationTriggerType = 'EVENT' | 'SCHEDULE' | 'CONDITION' | 'API';

export type AutomationActionType = 'RUNTIME_ACTION' | 'CREATE_HUMAN_TASK' | 'NOTIFY';

export interface AutomationTriggerDefinition {
  type: AutomationTriggerType;
  /** Match EventDefinition.code when type is EVENT */
  eventCode?: string;
  /** Run every N minutes when type is SCHEDULE */
  intervalMinutes?: number;
  /** Condition expression when type is CONDITION */
  condition?: unknown;
}

export interface AutomationActionDefinition {
  type: AutomationActionType;
  config: Record<string, unknown>;
}

export interface AutomationDefinition {
  code: string;
  entityCode: string;
  enabled: boolean;
  trigger: AutomationTriggerDefinition;
  actions: AutomationActionDefinition[];
}
