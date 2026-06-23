import { Injectable } from '@nestjs/common';
import type { RuntimeContext, RuntimeDocument } from '@redios/shared';
import { ProcessEngine, type ProcessExecutionPlan } from '../process/process-engine.service';
import type { WorkflowTransitionResult } from '../workflow/workflow-engine.service';
import type { FlowExecutionResult } from './flow.definition';
import { FlowExecutor } from './flow.executor';

@Injectable()
export class TunasFlowEngine {
  constructor(
    private readonly processEngine: ProcessEngine,
    private readonly flowExecutor: FlowExecutor,
  ) {}

  async execute(
    context: RuntimeContext,
    entityCode: string,
    actionCode: string,
    workflow: WorkflowTransitionResult,
    document: RuntimeDocument,
  ): Promise<FlowExecutionResult> {
    const plan = await this.processEngine.execute(context, entityCode, actionCode, workflow, document);
    return this.flowExecutor.execute(context, entityCode, document, plan);
  }

  /** Backward-compatible plan shape for BusinessEngine and EventEngine. */
  toProcessPlan(flow: FlowExecutionResult): ProcessExecutionPlan {
    return {
      executed: flow.executed,
      processCode: flow.processCode,
      steps: flow.steps.map((step) => ({
        code: step.code,
        type: step.type,
        status: step.status === 'EXECUTED' ? 'EXECUTED' : step.status === 'FAILED' ? 'FAILED' : 'READY',
      })),
      next: 'BUSINESS_ENGINE',
    };
  }
}
