export type RuntimeDocumentStatus = 'DRAFT' | 'ACTIVE' | 'APPROVED' | 'CLOSED' | 'CANCELLED';

export interface RuntimeDocument<TData extends Record<string, unknown> = Record<string, unknown>> {
  id?: string;
  tenantId: string;
  domainCode: string;
  applicationCode: string;
  entityCode: string;
  documentNo?: string;
  status: RuntimeDocumentStatus;
  data: TData;
  metadataVersion: number;
  createdBy: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
