import { Injectable } from '@nestjs/common';
import type { ApplicationDefinition, MetadataDefinition, RuntimeContext } from '@redios/shared';
import { MetadataResolver } from '../metadata/metadata-resolver.service';

@Injectable()
export class ApplicationEngine {
  constructor(private readonly metadataResolver: MetadataResolver) {}

  resolve(context: RuntimeContext): Promise<MetadataDefinition<ApplicationDefinition>> {
    return this.metadataResolver.resolveApplication(context);
  }
}
