import { Injectable } from '@nestjs/common';
import type { MetadataDefinition, RuntimeContext } from '@redios/shared';
import type { MetadataProvider, MetadataQuery } from './metadata-provider.interface';

@Injectable()
export class InMemoryMetadataProvider implements MetadataProvider {
  private readonly definitions = new Map<string, MetadataDefinition>();

  register(definitions: MetadataDefinition[]): void {
    for (const definition of definitions) {
      this.definitions.set(this.createKey(definition), definition);
    }
  }

  async find(context: RuntimeContext, query: MetadataQuery = {}): Promise<MetadataDefinition[]> {
    return [...this.definitions.values()].filter((definition) => this.matches(context, definition, query));
  }

  async findOne(context: RuntimeContext, query: MetadataQuery): Promise<MetadataDefinition | null> {
    const [definition] = await this.find(context, query);
    return definition ?? null;
  }

  private matches(context: RuntimeContext, definition: MetadataDefinition, query: MetadataQuery): boolean {
    if (definition.tenantId !== context.tenantId) {
      return false;
    }

    if (definition.domainCode && definition.domainCode !== context.domainCode) {
      return false;
    }

    if ((query.applicationCode ?? context.applicationCode) !== definition.applicationCode) {
      return false;
    }

    if (query.type && query.type !== definition.type) {
      return false;
    }

    if (query.code && query.code !== definition.code) {
      return false;
    }

    if (query.enabledOnly && !definition.enabled) {
      return false;
    }

    return true;
  }

  private createKey(definition: MetadataDefinition): string {
    return [
      definition.tenantId,
      definition.domainCode ?? '*',
      definition.applicationCode,
      definition.type,
      definition.code,
    ].join(':');
  }
}
