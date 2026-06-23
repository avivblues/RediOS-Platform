import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { RuntimeContext } from '@redios/shared';
import { Model } from 'mongoose';
import {
  WORKFLOW_STATE_HISTORY_MODEL,
  type WorkflowStateHistoryRecord,
} from './state-history.schema';

export interface WorkflowStateTransitionInput {
  entityCode: string;
  documentId: string;
  fromStatus: string;
  toStatus: string;
  actionCode: string;
  traceId?: string;
}

export interface WorkflowStateHistoryEntry {
  id: string;
  entityCode: string;
  documentId: string;
  fromStatus: string;
  toStatus: string;
  actionCode: string;
  actorId?: string;
  traceId?: string;
  occurredAt: string;
}

type WorkflowStateHistoryDoc = WorkflowStateHistoryRecord & { _id?: unknown };

@Injectable()
export class StateEngine {
  constructor(
    @InjectModel(WORKFLOW_STATE_HISTORY_MODEL)
    private readonly model: Model<WorkflowStateHistoryDoc>,
  ) {}

  async recordTransition(context: RuntimeContext, input: WorkflowStateTransitionInput): Promise<WorkflowStateHistoryEntry> {
    const occurredAt = new Date();
    const record = await this.model.create({
      tenantId: context.tenantId,
      domainCode: context.domainCode,
      applicationCode: context.applicationCode,
      entityCode: input.entityCode,
      documentId: input.documentId,
      fromStatus: input.fromStatus,
      toStatus: input.toStatus,
      actionCode: input.actionCode,
      actorId: context.userId,
      traceId: input.traceId,
      occurredAt,
    });

    return this.toEntry(record.toObject());
  }

  async findByDocument(
    context: RuntimeContext,
    entityCode: string,
    documentId: string,
    limit = 50,
  ): Promise<WorkflowStateHistoryEntry[]> {
    const records = await this.model
      .find({
        tenantId: context.tenantId,
        entityCode,
        documentId,
      })
      .sort({ occurredAt: -1 })
      .limit(limit)
      .lean();

    return records.map((record) => this.toEntry(record));
  }

  private toEntry(record: WorkflowStateHistoryDoc): WorkflowStateHistoryEntry {
    return {
      id: String(record._id),
      entityCode: record.entityCode,
      documentId: record.documentId,
      fromStatus: record.fromStatus,
      toStatus: record.toStatus,
      actionCode: record.actionCode,
      actorId: record.actorId,
      traceId: record.traceId,
      occurredAt: record.occurredAt.toISOString(),
    };
  }
}
