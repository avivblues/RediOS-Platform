import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type {
  FormDefinition,
  MetadataDefinition,
  ResolvedSyncPolicy,
  RuntimeContext,
  SyncDefinition,
} from '@redios/shared';
import { METADATA_PROVIDER, type MetadataProvider } from '../metadata/metadata-provider.interface';

export interface SyncBootstrapPackage {
  metadataVersion: number;
  entities: MetadataDefinition[];
  forms: MetadataDefinition<FormDefinition>[];
  workflow: MetadataDefinition[];
  security: MetadataDefinition[];
  navigation: MetadataDefinition[];
  theme: MetadataDefinition[];
  experience: MetadataDefinition[];
}

@Injectable()
export class SyncPolicyEngine {
  constructor(@Inject(METADATA_PROVIDER) private readonly metadataProvider: MetadataProvider) {}

  async resolvePolicy(context: RuntimeContext, entityCode: string): Promise<ResolvedSyncPolicy> {
    const policies = await this.resolvePolicies(context);
    const policy = policies.find((candidate) => candidate.entityCode === entityCode);

    if (!policy) {
      throw new NotFoundException(`Metadata SYNC_POLICY:${entityCode} was not found.`);
    }

    return policy;
  }

  async resolvePolicies(context: RuntimeContext): Promise<ResolvedSyncPolicy[]> {
    const metadata = await this.metadataProvider.findMetadata(context, {
      type: 'SYNC_POLICY',
      enabledOnly: true,
    });

    return metadata
      .map((record) => this.toResolved(record.definition as SyncDefinition))
      .filter((policy) => policy.offline)
      .sort((left, right) => right.priority - left.priority);
  }

  async bootstrap(context: RuntimeContext): Promise<SyncBootstrapPackage> {
    const policies = await this.resolvePolicies(context);
    const entityCodes = new Set(policies.map((policy) => policy.entityCode));
    const metadata = await this.metadataProvider.findMetadata(context, {
      enabledOnly: true,
    });

    return {
      metadataVersion: this.metadataVersion(metadata),
      entities: metadata.filter((record) => record.type === 'ENTITY' && entityCodes.has(record.code)),
      forms: metadata.filter(
        (record): record is MetadataDefinition<FormDefinition> =>
          record.type === 'FORM' && entityCodes.has((record.definition as FormDefinition).entityCode),
      ),
      workflow: metadata.filter((record) => record.type === 'WORKFLOW' && entityCodes.has(this.entityCode(record.definition))),
      security: metadata.filter((record) => record.type === 'SECURITY_POLICY'),
      navigation: metadata.filter((record) => record.type === 'NAVIGATION'),
      theme: metadata.filter((record) => record.type === 'THEME'),
      experience: metadata.filter((record) => record.type === 'EXPERIENCE' && entityCodes.has(this.entityCode(record.definition))),
    };
  }

  private toResolved(definition: SyncDefinition): ResolvedSyncPolicy {
    return {
      code: definition.code,
      entityCode: definition.entityCode,
      offline: definition.offlineEnabled,
      strategy: definition.strategy,
      direction: definition.syncDirection,
      conflict: definition.conflictPolicy,
      retention: definition.retention,
      priority: definition.priority,
    };
  }

  private metadataVersion(metadata: MetadataDefinition[]): number {
    return metadata.reduce((version, record) => Math.max(version, record.version ?? 0), 0);
  }

  private entityCode(definition: unknown): string {
    return definition && typeof definition === 'object' && 'entityCode' in definition
      ? ((definition as { entityCode?: string }).entityCode ?? '')
      : '';
  }
}
