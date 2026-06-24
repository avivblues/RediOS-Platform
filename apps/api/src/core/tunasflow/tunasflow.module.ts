import { Module, OnModuleInit, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventBus } from '../event/event.bus';
import { EventModule } from '../event/event.module';
import { ExperienceModule } from '../experience/experience.module';
import { RuntimeModule } from '../runtime/runtime.module';
import { MetadataModule } from '../metadata/metadata.module';
import { ProcessModule } from '../process/process.module';
import { StorageModule } from '../storage/storage.module';
import { BusinessModule } from '../business/business.module';
import { FlowVersionModule } from './flow/flow-version.module';
import { ApprovalAssignment } from './approval/approval.assignment';
import { ApprovalEngine } from './approval/approval.engine';
import { EscalationEngine } from './approval/escalation.engine';
import { AutomationActionRunner } from './automation/automation.action';
import { AutomationEngine } from './automation/automation.engine';
import { AutomationEventSubscriber } from './automation/automation-event.subscriber';
import { AutomationScheduler } from './automation/scheduler';
import { FlowExecutor } from './flow.executor';
import { ConditionEvaluator } from './rule/condition.evaluator';
import { RuleEngine } from './rule/rule.engine';
import { StateEngine } from './state/state.engine';
import {
  WORKFLOW_STATE_HISTORY_MODEL,
  WorkflowStateHistorySchema,
} from './state/state-history.schema';
import { TunasFlowEngine } from './tunasflow.engine';

@Module({
  imports: [
    MetadataModule,
    ProcessModule,
    BusinessModule,
    StorageModule,
    FlowVersionModule,
    forwardRef(() => ExperienceModule),
    forwardRef(() => RuntimeModule),
    forwardRef(() => EventModule),
    MongooseModule.forFeature([
      {
        name: WORKFLOW_STATE_HISTORY_MODEL,
        schema: WorkflowStateHistorySchema,
      },
    ]),
  ],
  providers: [
    ConditionEvaluator,
    RuleEngine,
    ApprovalAssignment,
    ApprovalEngine,
    EscalationEngine,
    AutomationActionRunner,
    AutomationEngine,
    AutomationEventSubscriber,
    AutomationScheduler,
    FlowExecutor,
    TunasFlowEngine,
    StateEngine,
  ],
  exports: [
    TunasFlowEngine,
    StateEngine,
    ApprovalEngine,
    EscalationEngine,
    RuleEngine,
    FlowVersionModule,
    AutomationEngine,
  ],
})
export class TunasflowModule implements OnModuleInit {
  constructor(
    private readonly eventBus: EventBus,
    private readonly automationEventSubscriber: AutomationEventSubscriber,
  ) {}

  onModuleInit(): void {
    this.eventBus.register(this.automationEventSubscriber);
  }
}
