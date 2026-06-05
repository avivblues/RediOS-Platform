import { Inject, Injectable } from '@nestjs/common';
import type { RuntimeContext, RuntimeDocument } from '@redios/shared';
import {
  STORAGE_PROVIDER,
  type RuntimeDocumentPayload,
  type RuntimeDocumentUpdatePayload,
  type StorageProvider,
} from './storage-provider.interface';

@Injectable()
export class StorageEngine {
  constructor(@Inject(STORAGE_PROVIDER) private readonly provider: StorageProvider) {}

  create(
    context: RuntimeContext,
    entityCode: string,
    payload: RuntimeDocumentPayload,
  ): Promise<RuntimeDocument> {
    return this.provider.create(context, entityCode, payload);
  }

  update(
    context: RuntimeContext,
    entityCode: string,
    id: string,
    payload: RuntimeDocumentUpdatePayload,
  ): Promise<RuntimeDocument | null> {
    return this.provider.update(context, entityCode, id, payload);
  }

  findOne(context: RuntimeContext, entityCode: string, id: string): Promise<RuntimeDocument | null> {
    return this.provider.findOne(context, entityCode, id);
  }

  findMany(
    context: RuntimeContext,
    entityCode: string,
    query: Record<string, unknown> = {},
  ): Promise<RuntimeDocument[]> {
    return this.provider.findMany(context, entityCode, query);
  }
}
