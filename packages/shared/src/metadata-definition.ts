export type MetadataType =
  | 'APPLICATION'
  | 'ENTITY'
  | 'FIELD'
  | 'ACTION'
  | 'WORKFLOW'
  | 'PROCESS'
  | 'BUSINESS'
  | 'EVENT'
  | 'LEDGER'
  | 'RELATION'
  | 'VIEW'
  | 'UI'
  | 'FORM'
  | 'THEME'
  | 'NAVIGATION'
  | 'REPORT'
  | 'EXPERIENCE'
  | 'RULE';

export interface MetadataDefinition<TDefinition = unknown> {
  id?: string;
  tenantId: string;
  domainCode?: string;
  applicationCode: string;
  type: MetadataType;
  code: string;
  name: string;
  version: number;
  enabled: boolean;
  definition: TDefinition;
  createdAt?: Date;
  updatedAt?: Date;
}
