import { Injectable } from '@nestjs/common';
import type {
  MetadataDefinition,
  ProcessDefinition,
  ProcessStepDefinition,
  RuntimeContext,
  RuntimeDocument,
} from '@redios/shared';
import { BusinessEngine } from '../business/business-engine.service';
import { ApprovalEngine } from './approval/approval.engine';
import type { ProcessExecutionPlan } from '../process/process-engine.service';
import { MetadataRegistry } from '../metadata/metadata-registry.service';
import { RuleEngine } from './rule/rule.engine';
import type { FlowExecutionResult, FlowStepResult } from './flow.definition';

@Injectable()
export class FlowExecutor {
  constructor(
    private readonly metadataRegistry: MetadataRegistry,
    private readonly businessEngine: BusinessEngine,
    private readonly ruleEngine: RuleEngine,
    private readonly approvalEngine: ApprovalEngine,
  ) {}

  async execute(
    context: RuntimeContext,
    entityCode: string,
    document: RuntimeDocument,
    plan: ProcessExecutionPlan,
  ): Promise<FlowExecutionResult> {
    if (!plan.executed || !plan.processCode) {
      return {
        executed: false,
        steps: [],
        next: 'BUSINESS_ENGINE',
      };
    }

    const process = await this.resolveProcess(context, plan.processCode);
    if (!process) {
      return {
        executed: plan.executed,
        processCode: plan.processCode,
        steps: plan.steps.map((step) => ({ ...step, status: 'SKIPPED', message: 'Process definition not found.' })),
        next: 'BUSINESS_ENGINE',
      };
    }

    const steps: FlowStepResult[] = [];

    for (const stepDef of this.sortedSteps(process.definition)) {
      if (!this.ruleEngine.shouldExecuteStep(document, stepDef)) {
        steps.push({
          code: stepDef.code,
          type: stepDef.type,
          status: 'SKIPPED',
          message: this.ruleEngine.skipReason(stepDef),
        });
        continue;
      }

      const result = await this.executeStep(context, entityCode, document, process.definition, stepDef);
      steps.push(result);

      if (result.status === 'FAILED') {
        break;
      }
    }

    return {
      executed: true,
      processCode: plan.processCode,
      steps,
      next: 'BUSINESS_ENGINE',
    };
  }

  private async executeStep(
    context: RuntimeContext,
    entityCode: string,
    document: RuntimeDocument,
    process: ProcessDefinition,
    step: ProcessStepDefinition,
  ): Promise<FlowStepResult> {
    if (step.type === 'VALIDATION' || step.type === 'BUSINESS') {
      const rules = await this.businessEngine.executeRulesForStep(
        context,
        entityCode,
        document,
        process.code,
        step.code,
      );

      return {
        code: step.code,
        type: step.type,
        status: 'EXECUTED',
        output: { rulesExecuted: rules.length },
      };
    }

    if (step.type === 'HUMAN_TASK') {
      const approval = await this.approvalEngine.createApprovalTasks(context, entityCode, document, process, step);

      return {
        code: step.code,
        type: step.type,
        status: 'EXECUTED',
        output: {
          humanTaskIds: approval.humanTaskIds,
          approvalMode: approval.approvalMode,
          levelsCreated: approval.levelsCreated,
          approvalGroupId: approval.approvalGroupId,
        },
      };
    }

    if (step.type === 'EVENT') {
      return {
        code: step.code,
        type: step.type,
        status: 'EXECUTED',
        output: { deferred: true, publishAt: 'EVENT_ENGINE' },
      };
    }

    return {
      code: step.code,
      type: step.type,
      status: 'READY',
      message: `Step type ${step.type} not yet implemented in TunasFlow.`,
    };
  }

  private sortedSteps(process: ProcessDefinition): ProcessStepDefinition[] {
    return process.steps.filter((step) => step.enabled).sort((left, right) => left.order - right.order);
  }

  private async resolveProcess(context: RuntimeContext, processCode: string) {
    const definitions = await this.metadataRegistry.findByType(context, 'PROCESS');
    return definitions.find((candidate) => (candidate.definition as ProcessDefinition).code === processCode) as
      | MetadataDefinition<ProcessDefinition>
      | undefined;
  }
}
