import { Module } from '@nestjs/common';
import { InMemoryMetadataProvider } from './in-memory-metadata.provider';
import { MetadataRegistry } from './metadata-registry.service';
import { MetadataResolver } from './metadata-resolver.service';
import { MetadataValidator } from './metadata-validator.service';
import { METADATA_PROVIDER } from './metadata-provider.interface';

@Module({
  providers: [
    InMemoryMetadataProvider,
    {
      provide: METADATA_PROVIDER,
      useExisting: InMemoryMetadataProvider,
    },
    MetadataRegistry,
    MetadataValidator,
    MetadataResolver,
  ],
  exports: [MetadataResolver, MetadataRegistry, MetadataValidator, METADATA_PROVIDER],
})
export class MetadataModule {}
