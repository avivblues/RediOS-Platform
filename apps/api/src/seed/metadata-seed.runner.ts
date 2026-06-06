import { Inject, Injectable, Logger } from '@nestjs/common';
import type { RuntimeContext } from '@redios/shared';
import { METADATA_PROVIDER, type MetadataProvider } from '../core/metadata/metadata-provider.interface';
import { metadataSeedRecords } from './metadata-seed.records';

@Injectable()
export class MetadataSeedRunner {
  private readonly logger = new Logger(MetadataSeedRunner.name);

  constructor(@Inject(METADATA_PROVIDER) private readonly metadataProvider: MetadataProvider) {}

  async run(): Promise<void> {
    const context: RuntimeContext = {
      userId: 'seed',
      tenantId: 'demo',
      domainCode: 'DEFAULT',
      applicationCode: 'ASSET_MAINTENANCE',
      permissions: [],
      capabilities: [],
    };

    for (const record of metadataSeedRecords) {
      await this.metadataProvider.saveMetadata(context, record);
    }

    this.logger.log(`Seeded ${metadataSeedRecords.length} metadata definitions.`);
  }
}
