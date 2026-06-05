import { Module } from '@nestjs/common';
import { ActionModule } from '../action/action.module';
import { ApplicationModule } from '../application/application.module';
import { MetadataModule } from '../metadata/metadata.module';
import { ProcessModule } from '../process/process.module';
import { SecurityModule } from '../security/security.module';
import { StorageModule } from '../storage/storage.module';
import { WorkflowModule } from '../workflow/workflow.module';
import { RuntimeExecutor } from './runtime-executor.service';

@Module({
  imports: [ApplicationModule, MetadataModule, SecurityModule, ActionModule, WorkflowModule, ProcessModule, StorageModule],
  providers: [RuntimeExecutor],
  exports: [RuntimeExecutor],
})
export class RuntimeModule {}
