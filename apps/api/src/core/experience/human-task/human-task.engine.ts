import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { CreateHumanTaskInput, HumanTaskDefinition, InboxItem, ResolvedPersona, RuntimeContext } from '@redios/shared';
import { Model } from 'mongoose';
import {
  EXPERIENCE_HUMAN_TASK_MODEL,
  type ExperienceHumanTaskRecord,
} from './schemas/experience-human-task.schema';

@Injectable()
export class HumanTaskEngine {
  constructor(
    @InjectModel(EXPERIENCE_HUMAN_TASK_MODEL)
    private readonly model: Model<ExperienceHumanTaskRecord>,
  ) {}

  async create(input: CreateHumanTaskInput): Promise<HumanTaskDefinition> {
    const saved = await this.model.create({
      tenantId: input.tenantId,
      title: input.title,
      entityCode: input.entityCode,
      documentId: input.documentId,
      actionCode: input.actionCode,
      processCode: input.processCode,
      stepCode: input.stepCode,
      assigneeUserId: input.assigneeUserId,
      assigneeRoles: input.assigneeRoles ?? [],
      status: 'WAITING',
      priority: input.priority ?? 'NORMAL',
      source: input.source ?? 'PROCESS',
      dueAt: input.dueAt ? new Date(input.dueAt) : undefined,
      approvalMode: input.approvalMode,
      approvalLevel: input.approvalLevel,
      approvalGroupId: input.approvalGroupId,
      delegatedFromUserId: input.delegatedFromUserId,
      delegatedToUserId: input.delegatedToUserId,
      escalatedFromTaskId: input.escalatedFromTaskId,
      escalatedAt: input.escalatedAt ? new Date(input.escalatedAt) : undefined,
    });

    return this.toDefinition(saved.toObject());
  }

  async findOne(context: RuntimeContext, taskId: string): Promise<HumanTaskDefinition | null> {
    const record = await this.model.findOne({ _id: taskId, tenantId: context.tenantId }).lean().exec();
    return record ? this.toDefinition(record) : null;
  }

  async complete(context: RuntimeContext, taskId: string): Promise<HumanTaskDefinition | null> {
    const updated = await this.model
      .findOneAndUpdate(
        { _id: taskId, tenantId: context.tenantId, status: { $in: ['WAITING', 'IN_PROGRESS'] } },
        { status: 'DONE' },
        { new: true },
      )
      .lean()
      .exec();

    return updated ? this.toDefinition(updated) : null;
  }

  async delegate(
    context: RuntimeContext,
    taskId: string,
    input: { assigneeUserId?: string; assigneeRoles?: string[] },
  ): Promise<HumanTaskDefinition | null> {
    const task = await this.findOne(context, taskId);
    if (!task || task.status === 'DONE' || task.status === 'CANCELLED') {
      return null;
    }

    const updated = await this.model
      .findOneAndUpdate(
        { _id: taskId, tenantId: context.tenantId, status: { $in: ['WAITING', 'IN_PROGRESS'] } },
        {
          delegatedFromUserId: context.userId,
          delegatedToUserId: input.assigneeUserId,
          assigneeUserId: input.assigneeUserId,
          assigneeRoles: input.assigneeRoles ?? task.assigneeRoles,
        },
        { new: true },
      )
      .lean()
      .exec();

    return updated ? this.toDefinition(updated) : null;
  }

  async escalate(context: RuntimeContext, taskId: string, escalationRole: string): Promise<HumanTaskDefinition | null> {
    const task = await this.findOne(context, taskId);
    if (!task || task.status === 'DONE' || task.status === 'CANCELLED' || task.escalatedAt) {
      return null;
    }

    await this.model
      .findOneAndUpdate(
        { _id: taskId, tenantId: context.tenantId },
        { status: 'CANCELLED', escalatedAt: new Date() },
      )
      .exec();

    return this.create({
      tenantId: context.tenantId,
      title: `${task.title} (Escalated)`,
      entityCode: task.entityCode,
      documentId: task.documentId,
      actionCode: task.actionCode,
      processCode: task.processCode,
      stepCode: task.stepCode,
      assigneeRoles: [escalationRole],
      priority: 'HIGH',
      source: task.source,
      dueAt: task.dueAt,
      approvalMode: task.approvalMode,
      approvalLevel: task.approvalLevel,
      approvalGroupId: task.approvalGroupId,
      escalatedFromTaskId: task.id,
    });
  }

  async findOverdue(context: RuntimeContext): Promise<HumanTaskDefinition[]> {
    const now = new Date();
    const records = await this.model
      .find({
        tenantId: context.tenantId,
        status: { $in: ['WAITING', 'IN_PROGRESS'] },
        dueAt: { $lte: now },
        escalatedAt: { $exists: false },
      })
      .limit(100)
      .lean()
      .exec();

    return records.map((record) => this.toDefinition(record));
  }

  async countForTenant(tenantId: string): Promise<number> {
    return this.model.countDocuments({ tenantId }).exec();
  }

  async list(context: RuntimeContext, persona: ResolvedPersona): Promise<HumanTaskDefinition[]> {
    const roles = [...(context.roles ?? []), persona.persona, ...persona.sourceRoles];
    const records = await this.model
      .find({
        tenantId: context.tenantId,
        status: { $in: ['WAITING', 'IN_PROGRESS'] },
        $or: [
          { assigneeUserId: context.userId },
          { assigneeRoles: { $in: roles } },
          { assigneeRoles: { $size: 0 } },
        ],
      })
      .sort({ priority: 1, createdAt: -1 })
      .limit(50)
      .lean()
      .exec();

    return records.map((record) => this.toDefinition(record));
  }

  private toDefinition(record: ExperienceHumanTaskRecord & { _id?: unknown }): HumanTaskDefinition {
    return {
      id: String(record._id ?? record.id ?? ''),
      tenantId: record.tenantId,
      title: record.title,
      entityCode: record.entityCode,
      documentId: record.documentId,
      actionCode: record.actionCode,
      processCode: record.processCode,
      stepCode: record.stepCode,
      assigneeUserId: record.assigneeUserId,
      assigneeRoles: record.assigneeRoles ?? [],
      status: record.status,
      priority: record.priority,
      source: record.source,
      dueAt: record.dueAt ? new Date(record.dueAt).toISOString() : undefined,
      approvalMode: record.approvalMode,
      approvalLevel: record.approvalLevel,
      approvalGroupId: record.approvalGroupId,
      delegatedFromUserId: record.delegatedFromUserId,
      delegatedToUserId: record.delegatedToUserId,
      escalatedFromTaskId: record.escalatedFromTaskId,
      escalatedAt: record.escalatedAt ? new Date(record.escalatedAt).toISOString() : undefined,
      createdAt: record.createdAt ? new Date(record.createdAt).toISOString() : new Date().toISOString(),
    };
  }

  toInboxItems(tasks: HumanTaskDefinition[]): InboxItem[] {
    return tasks.map((task) => ({
      id: `human_${task.id}`,
      title: task.title,
      entityCode: task.entityCode ?? 'HUMAN_TASK',
      documentId: task.documentId,
      actionCode: task.actionCode ?? 'COMPLETE',
      status: task.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'WAITING',
      priority: task.priority,
      source: 'PROCESS',
      dueAt: task.dueAt,
    }));
  }
}
