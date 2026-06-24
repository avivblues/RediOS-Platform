import { Module } from '@nestjs/common';
import { MetadataModule } from '../metadata/metadata.module';
import { FlowVersionModule } from '../tunasflow/flow/flow-version.module';
import { ProcessEngine } from './process-engine.service';

@Module({
  imports: [MetadataModule, FlowVersionModule],
  providers: [ProcessEngine],
  exports: [ProcessEngine],
})
export class ProcessModule {}
