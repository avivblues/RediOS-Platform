export interface WorkflowStateDefinition {
  code: string;
  label: string;
  type?: 'INITIAL' | 'NORMAL' | 'FINAL';
  colorToken?: string;
  initial?: boolean;
  final?: boolean;
}

export interface WorkflowTransitionDefinition {
  code: string;
  from: string;
  to: string;
  actionCode: string;
  condition?: Record<string, unknown> | string;
  securityPolicy?: string;
  processBinding?: string;
  conditions?: Record<string, unknown>;
}

export interface WorkflowDefinition {
  code: string;
  entityCode: string;
  states: WorkflowStateDefinition[];
  transitions: WorkflowTransitionDefinition[];
  enabled: boolean;
}
