import type { RuntimeContext, RuntimeDocument, RuntimeDocumentStatus } from '@redios/shared';

export interface RuntimeDocumentPayload {
  documentNo?: string;
  status?: RuntimeDocumentStatus;
  data: Record<string, unknown>;
  metadataVersion: number;
}

export type RuntimeDocumentUpdatePayload = Partial<Omit<RuntimeDocumentPayload, 'metadataVersion'>> & {
  metadataVersion?: number;
};

export interface StorageProvider {
  create(
    context: RuntimeContext,
    entityCode: string,
    payload: RuntimeDocumentPayload,
  ): Promise<RuntimeDocument>;
  update(
    context: RuntimeContext,
    entityCode: string,
    id: string,
    payload: RuntimeDocumentUpdatePayload,
  ): Promise<RuntimeDocument | null>;
  findOne(context: RuntimeContext, entityCode: string, id: string): Promise<RuntimeDocument | null>;
  findMany(
    context: RuntimeContext,
    entityCode: string,
    query?: Record<string, unknown>,
  ): Promise<RuntimeDocument[]>;
}

export const STORAGE_PROVIDER = Symbol('STORAGE_PROVIDER');
