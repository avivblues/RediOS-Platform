import { Schema } from 'mongoose';

export const RUNTIME_TRACE_MODEL = 'RuntimeTrace';
export const RUNTIME_TRACE_COLLECTION = 'runtime_traces';

const RuntimeTraceStepSchema = new Schema(
  {
    engine: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    startedAt: {
      type: Date,
      required: true,
    },
    finishedAt: {
      type: Date,
      required: true,
    },
    durationMs: {
      type: Number,
      required: true,
    },
    input: {
      type: Schema.Types.Mixed,
      required: false,
    },
    output: {
      type: Schema.Types.Mixed,
      required: false,
    },
    error: {
      type: Schema.Types.Mixed,
      required: false,
    },
  },
  {
    _id: false,
  },
);

export const RuntimeTraceSchema = new Schema(
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
      required: false,
    },
    actionCode: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      required: true,
    },
    startedAt: {
      type: Date,
      required: true,
    },
    finishedAt: {
      type: Date,
      required: false,
    },
    durationMs: {
      type: Number,
      required: false,
    },
    steps: {
      type: [RuntimeTraceStepSchema],
      required: true,
      default: [],
    },
  },
  {
    collection: RUNTIME_TRACE_COLLECTION,
  },
);

RuntimeTraceSchema.index({
  tenantId: 1,
  domainCode: 1,
  applicationCode: 1,
  entityCode: 1,
  documentId: 1,
  actionCode: 1,
  status: 1,
});
