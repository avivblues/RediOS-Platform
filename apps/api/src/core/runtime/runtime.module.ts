import { Module, forwardRef } from '@nestjs/common';
import { ActionModule } from '../action/action.module';
import { ApplicationModule } from '../application/application.module';
import { BusinessModule } from '../business/business.module';
import { CompilerModule } from '../compiler/compiler.module';
import { ConflictModule } from '../conflict/conflict.module';
import { EventModule } from '../event/event.module';
import { LedgerModule } from '../ledger/ledger.module';
import { MetadataModule } from '../metadata/metadata.module';
import { SecurityModule } from '../security/security.module';
import { SecurityPolicyModule } from '../security-policy/security-policy.module';
import { StorageModule } from '../storage/storage.module';
import { TraceModule } from '../trace/trace.module';
import { TunasflowModule } from '../tunasflow/tunasflow.module';
import { WorkflowModule } from '../workflow/workflow.module';
import { RuntimeExecutor } from './runtime-executor.service';

@Module({
  imports: [
    ApplicationModule,
    CompilerModule,
    ConflictModule,
    MetadataModule,
    SecurityModule,
    SecurityPolicyModule,
    ActionModule,
    WorkflowModule,
    forwardRef(() => TunasflowModule),
    BusinessModule,
    EventModule,
    LedgerModule,
    TraceModule,
    StorageModule,
  ],
  providers: [RuntimeExecutor],
  exports: [RuntimeExecutor, TunasflowModule],
})
export class RuntimeModule {}
