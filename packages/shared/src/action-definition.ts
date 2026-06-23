export type ActionType = 'CREATE' | 'READ' | 'UPDATE' | 'APPROVE' | 'CANCEL' | 'CUSTOM';

export interface ActionBehaviorDefinition {
  requiresApproval: boolean;
  confirmation: boolean;
}

export interface ActionDefinition {
  code: string;
  entityCode: string;
  label: string;
  type: ActionType;
  enabled: boolean;
  permissions?: string[];
  behavior: ActionBehaviorDefinition;
  capabilityCode?: string;
}
