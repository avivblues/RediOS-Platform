import { Inject, Injectable } from '@nestjs/common';
import type { MetadataDefinition, MetadataType, RuntimeContext } from '@redios/shared';
import { MetadataCache } from './metadata.cache';
import { MetadataLoader } from './metadata.loader';
import { METADATA_PROVIDER, type MetadataProvider } from './metadata-provider.interface';

@Injectable()
export class MetadataRegistry {
  constructor(
    @Inject(METADATA_PROVIDER) private readonly provider: MetadataProvider,
    private readonly cache: MetadataCache,
    private readonly loader: MetadataLoader,
  ) {}

  async findByType(context: RuntimeContext, type: MetadataType): Promise<MetadataDefinition[]> {
    if (this.cache.isScopeLoaded(context)) {
      return this.cache.getByType(context, type).filter((record) => record.enabled);
    }

    const definitions = await this.provider.getByType(context, type);
    this.cache.setMany(definitions);
    this.cache.markScopeLoaded(context);
    return definitions;
  }

  async findOne(context: RuntimeContext, type: MetadataType, code: string): Promise<MetadataDefinition | null> {
    const cached = this.cache.get(context, type, code);
    if (cached) {
      return cached.enabled ? cached : null;
    }

    const definition = await this.provider.getByCode(context, type, code);
    if (definition) {
      this.cache.set(definition);
    }

    return definition;
  }

  async register(context: RuntimeContext, definition: MetadataDefinition): Promise<MetadataDefinition> {
    const saved = await this.provider.saveMetadata(context, definition);
    this.cache.set(saved);
    return saved;
  }

  async invalidate(context: RuntimeContext): Promise<number> {
    return this.loader.reloadScope(context);
  }
}
