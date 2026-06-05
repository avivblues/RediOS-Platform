export interface WorkflowStateDefinition {
  code: string;
  name: string;
  initial?: boolean;
  terminal?: boolean;
}

export interface WorkflowTransitionDefinition {
  code: string;
  fromState: string;
  toState: string;
  actionCode: string;
  permissionCode?: string;
}

export interface WorkflowDefinition {
  code: string;
  name: string;
  entityCode: string;
  states: WorkflowStateDefinition[];
  transitions: WorkflowTransitionDefinition[];
  enabled: boolean;
}
