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
  | 'SECURITY_POLICY'
  | 'INTEGRATION'
  | 'CONNECTOR'
  | 'RUNTIME_PACKAGE'
  | 'SYNC_POLICY'
  | 'CONFLICT_POLICY'
  | 'REPORT'
  | 'EXPERIENCE'
  | 'WORKSPACE'
  | 'PERSONA'
  | 'RULE'
  | 'AUTOMATION';

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
