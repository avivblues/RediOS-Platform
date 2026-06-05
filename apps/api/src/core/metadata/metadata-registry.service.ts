import { Inject, Injectable } from '@nestjs/common';
import type { MetadataDefinition, MetadataType, RuntimeContext } from '@redios/shared';
import { METADATA_PROVIDER, type MetadataProvider } from './metadata-provider.interface';

@Injectable()
export class MetadataRegistry {
  constructor(@Inject(METADATA_PROVIDER) private readonly provider: MetadataProvider) {}

  findByType(context: RuntimeContext, type: MetadataType): Promise<MetadataDefinition[]> {
    return this.provider.getByType(context, type);
  }

  findOne(context: RuntimeContext, type: MetadataType, code: string): Promise<MetadataDefinition | null> {
    return this.provider.getByCode(context, type, code);
  }
}
