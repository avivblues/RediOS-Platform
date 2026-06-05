export type RuntimeDocumentStatus = 'DRAFT' | 'ACTIVE' | 'APPROVED' | 'CLOSED' | 'CANCELLED';

export interface RuntimeDocumentReference {
  entityCode: string;
  documentId: string;
  relationType: string;
}

export interface RuntimeDocument<
  THeader extends Record<string, unknown> = Record<string, unknown>,
  TLine extends Record<string, unknown> = Record<string, unknown>,
  TAttributes extends Record<string, unknown> = Record<string, unknown>,
> {
  id?: string;
  tenantId: string;
  domainCode: string;
  applicationCode: string;
  entityCode: string;
  documentNo?: string;
  status: RuntimeDocumentStatus;
  header: THeader;
  lines: TLine[];
  attributes: TAttributes;
  references: RuntimeDocumentReference[];
  createdAt?: Date;
  updatedAt?: Date;
}
