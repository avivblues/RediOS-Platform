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
