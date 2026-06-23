import { Injectable, Logger } from '@nestjs/common';
import type { HumanTaskDefinition, ProcessDefinition, ProcessStepDefinition, RuntimeContext, RuntimeDocument } from '@redios/shared';
import { HumanTaskEngine } from '../../experience/human-task/human-task.engine';
import { MetadataRegistry } from '../../metadata/metadata-registry.service';
import { StorageEngine } from '../../storage/storage.engine';
import { ApprovalAssignment } from './approval.assignment';
import type { ApprovalMode, ApprovalStepConfig } from './approval.policy';

export interface ApprovalTaskResult {
  humanTaskIds: string[];
  approvalMode: ApprovalMode;
  levelsCreated: number[];
  approvalGroupId?: string;
}

@Injectable()
export class ApprovalEngine {
  private readonly logger = new Logger(ApprovalEngine.name);

  constructor(
    private readonly humanTaskEngine: HumanTaskEngine,
    private readonly approvalAssignment: ApprovalAssignment,
    private readonly storageEngine: StorageEngine,
    private readonly metadataRegistry: MetadataRegistry,
  ) {}

  async createApprovalTasks(
    context: RuntimeContext,
    entityCode: string,
    document: RuntimeDocument,
    process: ProcessDefinition,
    step: ProcessStepDefinition,
  ): Promise<ApprovalTaskResult> {
    const config = (step.config ?? {}) as ApprovalStepConfig;
    const mode = this.resolveMode(config);
    const dueAt = this.resolveDueAt(config.slaHours);
    const approvalGroupId = mode === 'PARALLEL' ? `${process.code}:${step.code}:${document.id}:${Date.now()}` : undefined;

    if (mode === 'SINGLE' || !config.approvalLevels?.length) {
      const assigneeRoles = this.approvalAssignment.resolveSingleRoles(config);
      const saved = await this.humanTaskEngine.create({
        tenantId: context.tenantId,
        title: String(config.title ?? `${process.code}:${step.code}`),
        entityCode,
        documentId: document.id,
        actionCode: String(config.actionCode ?? 'APPROVE'),
        processCode: process.code,
        stepCode: step.code,
        assigneeRoles,
        priority: this.resolvePriority(config.priority),
        source: 'PROCESS',
        dueAt,
        approvalMode: mode,
        approvalLevel: 1,
        approvalGroupId,
      });

      return {
        humanTaskIds: [saved.id],
        approvalMode: mode,
        levelsCreated: [1],
        approvalGroupId,
      };
    }

    const requiredLevels = this.approvalAssignment.resolveLevels(document, config);

    if (requiredLevels.length === 0) {
      return { humanTaskIds: [], approvalMode: mode, levelsCreated: [] };
    }

    if (mode === 'SEQUENTIAL') {
      const first = requiredLevels[0];
      const saved = await this.humanTaskEngine.create({
        tenantId: context.tenantId,
        title: `${config.title ?? step.code} — ${first.label}`,
        entityCode,
        documentId: document.id,
        actionCode: String(config.actionCode ?? 'APPROVE'),
        processCode: process.code,
        stepCode: step.code,
        assigneeRoles: [first.role],
        priority: this.resolvePriority(config.priority),
        source: 'PROCESS',
        dueAt,
        approvalMode: mode,
        approvalLevel: first.level,
        approvalGroupId,
      });

      return {
        humanTaskIds: [saved.id],
        approvalMode: mode,
        levelsCreated: [first.level],
        approvalGroupId,
      };
    }

    const humanTaskIds: string[] = [];
    const levelsCreated: number[] = [];

    for (const level of requiredLevels) {
      const saved = await this.humanTaskEngine.create({
        tenantId: context.tenantId,
        title: `${config.title ?? step.code} — ${level.label}`,
        entityCode,
        documentId: document.id,
        actionCode: String(config.actionCode ?? 'APPROVE'),
        processCode: process.code,
        stepCode: step.code,
        assigneeRoles: [level.role],
        priority: this.resolvePriority(config.priority),
        source: 'PROCESS',
        dueAt,
        approvalMode: mode,
        approvalLevel: level.level,
        approvalGroupId,
      });

      humanTaskIds.push(saved.id);
      levelsCreated.push(level.level);
    }

    return { humanTaskIds, approvalMode: mode, levelsCreated, approvalGroupId };
  }

  async onTaskCompleted(context: RuntimeContext, task: HumanTaskDefinition): Promise<HumanTaskDefinition | null> {
    if (task.approvalMode !== 'SEQUENTIAL' || !task.approvalLevel || !task.entityCode || !task.documentId || !task.processCode || !task.stepCode) {
      return null;
    }

    const document = await this.storageEngine.findOne(context, task.entityCode, task.documentId);
    if (!document) {
      return null;
    }

    const step = await this.resolveProcessStep(context, task.processCode, task.stepCode);
    if (!step) {
      return null;
    }

    const config = (step.config ?? {}) as ApprovalStepConfig;
    const requiredLevels = this.approvalAssignment.resolveLevels(document, config);
    const nextLevel = requiredLevels.find((level) => level.level > task.approvalLevel!);

    if (!nextLevel) {
      this.logger.debug(`Approval chain complete for ${task.entityCode}:${task.documentId} at level ${task.approvalLevel}`);
      return null;
    }

    const dueAt = this.resolveDueAt(config.slaHours);

    return this.humanTaskEngine.create({
      tenantId: context.tenantId,
      title: `${config.title ?? task.stepCode} — ${nextLevel.label}`,
      entityCode: task.entityCode,
      documentId: task.documentId,
      actionCode: task.actionCode ?? 'APPROVE',
      processCode: task.processCode,
      stepCode: task.stepCode,
      assigneeRoles: [nextLevel.role],
      priority: task.priority,
      source: 'PROCESS',
      dueAt,
      approvalMode: 'SEQUENTIAL',
      approvalLevel: nextLevel.level,
    });
  }

  private resolveMode(config: ApprovalStepConfig): ApprovalMode {
    const mode = String(config.approvalMode ?? 'SINGLE').toUpperCase();
    if (mode === 'SEQUENTIAL' || mode === 'PARALLEL') {
      return mode;
    }

    return 'SINGLE';
  }

  private resolvePriority(priority: string | undefined): 'LOW' | 'NORMAL' | 'HIGH' {
    const normalized = String(priority ?? 'NORMAL').toUpperCase();
    if (normalized === 'HIGH') {
      return 'HIGH';
    }
    if (normalized === 'LOW') {
      return 'LOW';
    }
    return 'NORMAL';
  }

  private resolveDueAt(slaHours: number | undefined): string | undefined {
    if (!slaHours || slaHours <= 0) {
      return undefined;
    }

    return new Date(Date.now() + slaHours * 60 * 60 * 1000).toISOString();
  }

  private async resolveProcessStep(context: RuntimeContext, processCode: string, stepCode: string): Promise<ProcessStepDefinition | undefined> {
    const definitions = await this.metadataRegistry.findByType(context, 'PROCESS');
    const process = definitions.find((candidate) => (candidate.definition as ProcessDefinition).code === processCode);

    if (!process) {
      return undefined;
    }

    return (process.definition as ProcessDefinition).steps.find((step) => step.code === stepCode);
  }
}
