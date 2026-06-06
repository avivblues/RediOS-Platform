import { Module } from '@nestjs/common';
import { MetadataModule } from '../metadata/metadata.module';
import { RelationEngine } from './relation-engine.service';

@Module({
  imports: [MetadataModule],
  providers: [RelationEngine],
  exports: [RelationEngine],
})
export class RelationModule {}
