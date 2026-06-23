import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BusinessModule } from '../business/business.module';
import { ExperienceModule } from '../experience/experience.module';
import { MetadataModule } from '../metadata/metadata.module';
import { ProcessModule } from '../process/process.module';
import { StorageModule } from '../storage/storage.module';
import { ApprovalAssignment } from './approval/approval.assignment';
import { ApprovalEngine } from './approval/approval.engine';
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
    forwardRef(() => ExperienceModule),
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
    FlowExecutor,
    TunasFlowEngine,
    StateEngine,
  ],
  exports: [TunasFlowEngine, StateEngine, ApprovalEngine, RuleEngine],
})
export class TunasflowModule {}
