export type ProcessStepType = 'VALIDATION' | 'BUSINESS' | 'EVENT' | 'CUSTOM' | 'HUMAN_TASK';

export interface ProcessTriggerDefinition {
  actionCode: string;
  workflowState?: string;
}

export interface ProcessStepDefinition {
  code: string;
  type: ProcessStepType;
  order: number;
  enabled: boolean;
  config?: Record<string, unknown>;
}

export interface ProcessDefinition {
  code: string;
  entityCode: string;
  trigger: ProcessTriggerDefinition;
  steps: ProcessStepDefinition[];
  enabled: boolean;
}
