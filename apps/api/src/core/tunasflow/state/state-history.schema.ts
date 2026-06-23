import { Schema } from 'mongoose';

export const WORKFLOW_STATE_HISTORY_MODEL = 'WorkflowStateHistory';
export const WORKFLOW_STATE_HISTORY_COLLECTION = 'workflow_state_history';

export interface WorkflowStateHistoryRecord {
  tenantId: string;
  domainCode: string;
  applicationCode: string;
  entityCode: string;
  documentId: string;
  fromStatus: string;
  toStatus: string;
  actionCode: string;
  actorId?: string;
  traceId?: string;
  occurredAt: Date;
}

export const WorkflowStateHistorySchema = new Schema(
  {
    tenantId: { type: String, required: true, index: true },
    domainCode: { type: String, required: true },
    applicationCode: { type: String, required: true },
    entityCode: { type: String, required: true, index: true },
    documentId: { type: String, required: true, index: true },
    fromStatus: { type: String, required: true },
    toStatus: { type: String, required: true },
    actionCode: { type: String, required: true },
    actorId: { type: String, required: false },
    traceId: { type: String, required: false },
    occurredAt: { type: Date, required: true, default: Date.now, index: true },
  },
  {
    collection: WORKFLOW_STATE_HISTORY_COLLECTION,
    timestamps: false,
  },
);

WorkflowStateHistorySchema.index({ tenantId: 1, entityCode: 1, documentId: 1, occurredAt: -1 });
