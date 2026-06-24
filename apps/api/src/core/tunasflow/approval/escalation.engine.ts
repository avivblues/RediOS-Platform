import { Injectable, Logger } from '@nestjs/common';
import type { HumanTaskDefinition, ProcessStepDefinition, RuntimeContext } from '@redios/shared';
import { HumanTaskEngine } from '../../experience/human-task/human-task.engine';
import { MetadataRegistry } from '../../metadata/metadata-registry.service';
import type { ApprovalStepConfig } from './approval.policy';

export interface EscalationResult {
  taskId: string;
  escalatedTaskId?: string;
  status: 'ESCALATED' | 'SKIPPED';
  message?: string;
}

@Injectable()
export class EscalationEngine {
  private readonly logger = new Logger(EscalationEngine.name);

  constructor(
    private readonly humanTaskEngine: HumanTaskEngine,
    private readonly metadataRegistry: MetadataRegistry,
  ) {}

  async escalateOverdue(context: RuntimeContext): Promise<EscalationResult[]> {
    const overdue = await this.humanTaskEngine.findOverdue(context);
    const results: EscalationResult[] = [];

    for (const task of overdue) {
      results.push(await this.escalateTask(context, task));
    }

    return results;
  }

  async escalateTask(context: RuntimeContext, task: HumanTaskDefinition): Promise<EscalationResult> {
    if (task.escalatedAt || !task.processCode || !task.stepCode) {
      return { taskId: task.id, status: 'SKIPPED', message: 'Task already escalated or missing process context.' };
    }

    const step = await this.resolveProcessStep(context, task.processCode, task.stepCode);
    if (!step) {
      return { taskId: task.id, status: 'SKIPPED', message: 'Process step not found.' };
    }

    const config = (step.config ?? {}) as ApprovalStepConfig;
    const escalationRole = config.escalationRole;

    if (!escalationRole) {
      return { taskId: task.id, status: 'SKIPPED', message: 'No escalationRole configured.' };
    }

    if (task.dueAt && config.escalationAfterHours) {
      const dueAt = new Date(task.dueAt).getTime();
      const escalateAfter = dueAt + config.escalationAfterHours * 60 * 60 * 1000;
      if (Date.now() < escalateAfter) {
        return { taskId: task.id, status: 'SKIPPED', message: 'Escalation grace period not elapsed.' };
      }
    }

    const escalated = await this.humanTaskEngine.escalate(context, task.id, escalationRole);

    if (!escalated) {
      return { taskId: task.id, status: 'SKIPPED', message: 'Escalation failed.' };
    }

    this.logger.log(`Escalated task ${task.id} → ${escalated.id} (${escalationRole})`);

    return { taskId: task.id, escalatedTaskId: escalated.id, status: 'ESCALATED' };
  }

  private async resolveProcessStep(
    context: RuntimeContext,
    processCode: string,
    stepCode: string,
  ): Promise<ProcessStepDefinition | undefined> {
    const definitions = await this.metadataRegistry.findByType(context, 'PROCESS');
    const process = definitions.find((candidate) => (candidate.definition as { code?: string }).code === processCode);

    if (!process) {
      return undefined;
    }

    return (process.definition as { steps: ProcessStepDefinition[] }).steps.find((step) => step.code === stepCode);
  }
}
