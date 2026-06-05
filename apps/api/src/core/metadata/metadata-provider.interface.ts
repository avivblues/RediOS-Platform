import type { MetadataDefinition, MetadataType, RuntimeContext } from '@redios/shared';

export interface MetadataQuery {
  applicationCode?: string;
  type?: MetadataType;
  code?: string;
  enabledOnly?: boolean;
}

export interface MetadataProvider {
  find(context: RuntimeContext, query?: MetadataQuery): Promise<MetadataDefinition[]>;
  findOne(context: RuntimeContext, query: MetadataQuery): Promise<MetadataDefinition | null>;
}

export const METADATA_PROVIDER = Symbol('METADATA_PROVIDER');
