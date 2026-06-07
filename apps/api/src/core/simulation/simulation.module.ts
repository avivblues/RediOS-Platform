import { Module } from '@nestjs/common';
import { ActionModule } from '../action/action.module';
import { BusinessModule } from '../business/business.module';
import { EventModule } from '../event/event.module';
import { FormModule } from '../form/form.module';
import { LedgerModule } from '../ledger/ledger.module';
import { MetadataModule } from '../metadata/metadata.module';
import { ProcessModule } from '../process/process.module';
import { RelationModule } from '../relation/relation.module';
import { SecurityModule } from '../security/security.module';
import { TraceModule } from '../trace/trace.module';
import { UIModule } from '../ui/ui.module';
import { WorkflowModule } from '../workflow/workflow.module';
import { SimulationEngine } from './simulation-engine.service';

@Module({
  imports: [
    MetadataModule,
    ActionModule,
    SecurityModule,
    WorkflowModule,
    ProcessModule,
    BusinessModule,
    EventModule,
    LedgerModule,
    RelationModule,
    TraceModule,
    UIModule,
    FormModule,
  ],
  providers: [SimulationEngine],
  exports: [SimulationEngine],
})
export class SimulationModule {}
