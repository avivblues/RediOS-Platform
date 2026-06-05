import { Module } from '@nestjs/common';
import { MetadataModule } from '../metadata/metadata.module';
import { WorkflowEngine } from './workflow-engine.service';

@Module({
  imports: [MetadataModule],
  providers: [WorkflowEngine],
  exports: [WorkflowEngine],
})
export class WorkflowModule {}
