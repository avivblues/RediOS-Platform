import { Injectable } from '@nestjs/common';
import type { MetadataDefinition, MetadataType, RuntimeContext } from '@redios/shared';

function scopeKey(context: Pick<RuntimeContext, 'tenantId' | 'domainCode' | 'applicationCode'>): string {
  return `${context.tenantId}:${context.domainCode}:${context.applicationCode}`;
}

function recordKey(definition: Pick<MetadataDefinition, 'tenantId' | 'domainCode' | 'applicationCode' | 'type' | 'code' | 'version'>): string {
  return `${definition.tenantId}:${definition.domainCode ?? ''}:${definition.applicationCode}:${definition.type}:${definition.code}:v${definition.version}`;
}

@Injectable()
export class MetadataCache {
  private readonly records = new Map<string, MetadataDefinition>();
  private readonly loadedScopes = new Set<string>();

  clear(): void {
    this.records.clear();
    this.loadedScopes.clear();
  }

  set(definition: MetadataDefinition): void {
    this.records.set(recordKey(definition), definition);
    this.loadedScopes.add(`${definition.tenantId}:${definition.domainCode ?? ''}:${definition.applicationCode}`);
  }

  setMany(definitions: MetadataDefinition[]): void {
    for (const definition of definitions) {
      this.set(definition);
    }
  }

  get(context: RuntimeContext, type: MetadataType, code: string): MetadataDefinition | undefined {
    const prefix = `${scopeKey(context)}:${type}:${code}:v`;
    const matches = Array.from(this.records.values()).filter((record) => recordKey(record).startsWith(prefix));
    return matches.sort((left, right) => right.version - left.version)[0];
  }

  getByType(context: RuntimeContext, type: MetadataType): MetadataDefinition[] {
    const prefix = `${scopeKey(context)}:${type}:`;
    return Array.from(this.records.values()).filter((record) => recordKey(record).startsWith(prefix));
  }

  isScopeLoaded(context: RuntimeContext): boolean {
    return this.loadedScopes.has(scopeKey(context));
  }

  markScopeLoaded(context: RuntimeContext): void {
    this.loadedScopes.add(scopeKey(context));
  }

  invalidateScope(context: RuntimeContext): void {
    const prefix = `${scopeKey(context)}:`;
    for (const key of this.records.keys()) {
      if (key.startsWith(prefix)) {
        this.records.delete(key);
      }
    }
    this.loadedScopes.delete(scopeKey(context));
  }

  size(): number {
    return this.records.size;
  }
}
