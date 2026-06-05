export type MetadataType =
  | 'APPLICATION'
  | 'ENTITY'
  | 'FIELD'
  | 'ACTION'
  | 'WORKFLOW'
  | 'PROCESS'
  | 'FORM'
  | 'REPORT'
  | 'EXPERIENCE'
  | 'RULE';

export interface MetadataDefinition<TDefinition extends Record<string, unknown> = Record<string, unknown>> {
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
