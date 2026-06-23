import { Module } from '@nestjs/common';
import { CompilerModule } from '../compiler/compiler.module';
import { MetadataModule } from '../metadata/metadata.module';
import { WorkflowEngine } from './workflow-engine.service';

@Module({
  imports: [MetadataModule, CompilerModule],
  providers: [WorkflowEngine],
  exports: [WorkflowEngine],
})
export class WorkflowModule {}
