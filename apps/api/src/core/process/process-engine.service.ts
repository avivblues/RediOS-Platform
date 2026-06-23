import { Injectable } from '@nestjs/common';
import type { ProcessStepType, RuntimeContext, RuntimeDocument } from '@redios/shared';
import { MetadataResolver } from '../metadata/metadata-resolver.service';
import type { WorkflowTransitionResult } from '../workflow/workflow-engine.service';

export type ProcessStepStatus = 'READY' | 'EXECUTED' | 'FAILED' | 'SKIPPED';

export interface ProcessStepPlan {
  code: string;
  type: ProcessStepType;
  status: ProcessStepStatus;
}

export interface ProcessExecutionPlan {
  executed: boolean;
  processCode?: string;
  steps: ProcessStepPlan[];
  next: 'BUSINESS_ENGINE';
}

@Injectable()
export class ProcessEngine {
  constructor(private readonly metadataResolver: MetadataResolver) {}

  async execute(
    context: RuntimeContext,
    entityCode: string,
    actionCode: string,
    workflowResult: WorkflowTransitionResult,
    _document: RuntimeDocument,
  ): Promise<ProcessExecutionPlan> {
    const workflowState = workflowResult.transitioned ? workflowResult.to : undefined;
    const process = await this.metadataResolver.resolveProcess(context, entityCode, actionCode, workflowState);

    if (!process) {
      return {
        executed: false,
        steps: [],
        next: 'BUSINESS_ENGINE',
      };
    }

    const steps = process.definition.steps
      .filter((step) => step.enabled)
      .sort((left, right) => left.order - right.order)
      .map((step): ProcessStepPlan => ({ code: step.code, type: step.type, status: 'READY' }));

    return {
      executed: true,
      processCode: process.definition.code,
      steps,
      next: 'BUSINESS_ENGINE',
    };
  }
}
