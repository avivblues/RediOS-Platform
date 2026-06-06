import { Module } from '@nestjs/common';
import { MetadataModule } from '../core/metadata/metadata.module';
import { MetadataValidationController } from './metadata-validation.controller';

@Module({
  imports: [MetadataModule],
  controllers: [MetadataValidationController],
})
export class MetadataValidationModule {}
