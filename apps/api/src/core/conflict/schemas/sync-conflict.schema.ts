import { Schema } from 'mongoose';

export const SYNC_CONFLICT_MODEL = 'SyncConflict';
export const SYNC_CONFLICT_COLLECTION = 'sync_conflicts';

export const SyncConflictSchema = new Schema(
  {
    tenantId: {
      type: String,
      required: true,
    },
    domainCode: {
      type: String,
      required: true,
    },
    applicationCode: {
      type: String,
      required: true,
    },
    entityCode: {
      type: String,
      required: true,
    },
    documentId: {
      type: String,
      required: true,
    },
    policy: {
      type: String,
      required: true,
    },
    fields: {
      type: [Schema.Types.Mixed],
      required: true,
      default: [],
    },
    clientData: {
      type: Schema.Types.Mixed,
      required: true,
      default: {},
    },
    serverData: {
      type: Schema.Types.Mixed,
      required: true,
      default: {},
    },
    status: {
      type: String,
      required: true,
      enum: ['OPEN', 'RESOLVED'],
      default: 'OPEN',
    },
    resolvedBy: {
      type: String,
      required: false,
    },
    resolvedAt: {
      type: Date,
      required: false,
    },
    resolution: {
      type: String,
      required: false,
    },
  },
  {
    collection: SYNC_CONFLICT_COLLECTION,
    timestamps: {
      createdAt: true,
      updatedAt: true,
    },
  },
);

SyncConflictSchema.index({
  tenantId: 1,
  domainCode: 1,
  applicationCode: 1,
  entityCode: 1,
  documentId: 1,
  status: 1,
});
