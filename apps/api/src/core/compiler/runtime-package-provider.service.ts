import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { MetadataDefinition, RuntimeContext, RuntimePackageDefinition } from '@redios/shared';
import { METADATA_PROVIDER, type MetadataProvider } from '../metadata/metadata-provider.interface';

@Injectable()
export class RuntimePackageProvider {
  constructor(@Inject(METADATA_PROVIDER) private readonly metadataProvider: MetadataProvider) {}

  async getActive(context: RuntimeContext): Promise<MetadataDefinition<RuntimePackageDefinition> | null> {
    const packages = (await this.metadataProvider.findMetadata(context, {
      type: 'RUNTIME_PACKAGE',
      enabledOnly: true,
    })) as MetadataDefinition<RuntimePackageDefinition>[];

    return packages
      .filter((metadata) => metadata.definition.status === 'ACTIVE')
      .sort((left, right) => right.definition.metadataVersion - left.definition.metadataVersion)[0] ?? null;
  }

  async activate(context: RuntimeContext, version: number): Promise<MetadataDefinition<RuntimePackageDefinition>> {
    const packages = (await this.metadataProvider.findMetadata(context, {
      type: 'RUNTIME_PACKAGE',
      enabledOnly: true,
    })) as MetadataDefinition<RuntimePackageDefinition>[];
    let activated: MetadataDefinition<RuntimePackageDefinition> | undefined;

    for (const runtimePackage of packages) {
      const nextStatus = runtimePackage.definition.metadataVersion === version ? 'ACTIVE' : 'EXPIRED';
      const saved = await this.metadataProvider.saveMetadata(context, {
        ...runtimePackage,
        enabled: true,
        definition: {
          ...runtimePackage.definition,
          status: nextStatus,
        },
      });

      if (nextStatus === 'ACTIVE') {
        activated = saved as MetadataDefinition<RuntimePackageDefinition>;
      }
    }

    if (!activated) {
      throw new NotFoundException(`Runtime package version ${version} was not found.`);
    }

    return activated;
  }

  async expire(context: RuntimeContext, version: number): Promise<void> {
    const packages = (await this.metadataProvider.findMetadata(context, {
      type: 'RUNTIME_PACKAGE',
      enabledOnly: true,
    })) as MetadataDefinition<RuntimePackageDefinition>[];

    for (const runtimePackage of packages.filter((candidate) => candidate.definition.metadataVersion === version)) {
      await this.metadataProvider.saveMetadata(context, {
        ...runtimePackage,
        enabled: true,
        definition: {
          ...runtimePackage.definition,
          status: 'EXPIRED',
        },
      });
    }
  }
}
