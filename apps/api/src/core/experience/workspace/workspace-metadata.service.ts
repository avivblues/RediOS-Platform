import { Inject, Injectable } from '@nestjs/common';
import type { MetadataDefinition, RuntimeContext, WorkspaceDefinition } from '@redios/shared';
import { METADATA_PROVIDER, type MetadataProvider } from '../../metadata/metadata-provider.interface';
import { MetadataRegistry } from '../../metadata/metadata-registry.service';

@Injectable()
export class WorkspaceMetadataService {
  constructor(
    @Inject(METADATA_PROVIDER) private readonly metadataProvider: MetadataProvider,
    private readonly metadataRegistry: MetadataRegistry,
  ) {}

  async list(context: RuntimeContext): Promise<MetadataDefinition<WorkspaceDefinition>[]> {
    const records = await this.metadataProvider.findMetadata(context, {
      type: 'WORKSPACE',
      allApplications: true,
      enabledOnly: false,
    });

    return records.filter((record) => record.type === 'WORKSPACE') as MetadataDefinition<WorkspaceDefinition>[];
  }

  async save(context: RuntimeContext, definition: WorkspaceDefinition): Promise<MetadataDefinition<WorkspaceDefinition>> {
    const record: MetadataDefinition<WorkspaceDefinition> = {
      tenantId: context.tenantId,
      domainCode: context.domainCode,
      applicationCode: 'REDIOS_PLATFORM',
      type: 'WORKSPACE',
      code: definition.code,
      name: definition.title,
      version: 1,
      enabled: definition.enabled ?? true,
      definition,
    };

    return this.metadataRegistry.register(context, record) as Promise<MetadataDefinition<WorkspaceDefinition>>;
  }
}
