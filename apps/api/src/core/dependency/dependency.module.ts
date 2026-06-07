import { Module } from '@nestjs/common';
import { MetadataModule } from '../metadata/metadata.module';
import { DependencyEngine } from './dependency-engine.service';

@Module({
  imports: [MetadataModule],
  providers: [DependencyEngine],
  exports: [DependencyEngine],
})
export class DependencyModule {}
