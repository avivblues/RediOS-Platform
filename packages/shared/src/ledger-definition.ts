export type LedgerImpactType = 'CREATE_DOCUMENT' | 'UPDATE_DOCUMENT' | 'INCREMENT_FIELD' | 'DECREMENT_FIELD';

export interface LedgerTriggerDefinition {
  actionCode: string;
  workflowState?: string;
  eventCode?: string;
}

export interface LedgerImpact {
  code: string;
  type: LedgerImpactType;
  target: {
    entityCode: string;
  };
  mapping: Record<string, string>;
  enabled: boolean;
}

export interface LedgerDefinition {
  code: string;
  entityCode: string;
  trigger: LedgerTriggerDefinition;
  impacts: LedgerImpact[];
  enabled: boolean;
}
