import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MetadataRegistry } from './metadata-registry.service';
import { MetadataResolver } from './metadata-resolver.service';
import { MetadataValidator } from './metadata-validator.service';
import { MetadataValidatorEngine } from './metadata-validator-engine.service';
import { METADATA_PROVIDER } from './metadata-provider.interface';
import { MongoMetadataProvider } from './providers/mongo-metadata.provider';
import { METADATA_DEFINITION_MODEL, MetadataDefinitionSchema } from './schemas/metadata-definition.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: METADATA_DEFINITION_MODEL,
        schema: MetadataDefinitionSchema,
      },
    ]),
  ],
  providers: [
    MongoMetadataProvider,
    {
      provide: METADATA_PROVIDER,
      useExisting: MongoMetadataProvider,
    },
    MetadataRegistry,
    MetadataValidator,
    MetadataValidatorEngine,
    MetadataResolver,
  ],
  exports: [MetadataResolver, MetadataRegistry, MetadataValidator, MetadataValidatorEngine, METADATA_PROVIDER],
})
export class MetadataModule {}
