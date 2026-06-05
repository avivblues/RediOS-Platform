import type { MetadataDefinition, MetadataType, RuntimeContext } from '@redios/shared';

export interface MetadataQuery {
  applicationCode?: string;
  type?: MetadataType;
  code?: string;
  enabledOnly?: boolean;
}

export interface MetadataProvider {
  findMetadata(context: RuntimeContext, query?: MetadataQuery): Promise<MetadataDefinition[]>;
  saveMetadata(context: RuntimeContext, definition: MetadataDefinition): Promise<MetadataDefinition>;
  getByCode(context: RuntimeContext, type: MetadataType, code: string): Promise<MetadataDefinition | null>;
  getByType(context: RuntimeContext, type: MetadataType): Promise<MetadataDefinition[]>;
  find(context: RuntimeContext, query?: MetadataQuery): Promise<MetadataDefinition[]>;
  findOne(context: RuntimeContext, query: MetadataQuery): Promise<MetadataDefinition | null>;
}

export const METADATA_PROVIDER = Symbol('METADATA_PROVIDER');
