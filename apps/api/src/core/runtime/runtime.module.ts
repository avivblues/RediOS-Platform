import { Module } from '@nestjs/common';
import { ActionModule } from '../action/action.module';
import { ApplicationModule } from '../application/application.module';
import { MetadataModule } from '../metadata/metadata.module';
import { SecurityModule } from '../security/security.module';
import { RuntimeExecutor } from './runtime-executor.service';

@Module({
  imports: [ApplicationModule, MetadataModule, SecurityModule, ActionModule],
  providers: [RuntimeExecutor],
  exports: [RuntimeExecutor],
})
export class RuntimeModule {}
