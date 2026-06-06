import { Module } from '@nestjs/common';
import { ActionModule } from '../action/action.module';
import { BusinessModule } from '../business/business.module';
import { EventModule } from '../event/event.module';
import { MetadataModule } from '../metadata/metadata.module';
import { ProcessModule } from '../process/process.module';
import { SecurityModule } from '../security/security.module';
import { WorkflowModule } from '../workflow/workflow.module';
import { SimulationEngine } from './simulation-engine.service';

@Module({
  imports: [MetadataModule, ActionModule, SecurityModule, WorkflowModule, ProcessModule, BusinessModule, EventModule],
  providers: [SimulationEngine],
  exports: [SimulationEngine],
})
export class SimulationModule {}
