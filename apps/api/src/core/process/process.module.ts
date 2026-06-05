import { Module } from '@nestjs/common';
import { MetadataModule } from '../metadata/metadata.module';
import { ProcessEngine } from './process-engine.service';

@Module({
  imports: [MetadataModule],
  providers: [ProcessEngine],
  exports: [ProcessEngine],
})
export class ProcessModule {}
