export type EntityType = 'MASTER' | 'DOCUMENT' | 'LEDGER' | 'SNAPSHOT' | 'CONFIGURATION';

export interface EntityDefinition {
  code: string;
  name: string;
  type: EntityType;
  fieldCodes: string[];
  actionCodes: string[];
  workflowCode?: string;
  enabled: boolean;
}
