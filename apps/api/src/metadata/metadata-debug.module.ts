import { Module } from '@nestjs/common';
import { MetadataModule } from '../core/metadata/metadata.module';
import { MetadataDebugController } from './metadata-debug.controller';

@Module({
  imports: [MetadataModule],
  controllers: [MetadataDebugController],
})
export class MetadataDebugModule {}
