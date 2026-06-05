import { Schema } from 'mongoose';

export const RUNTIME_DOCUMENT_MODEL = 'RuntimeDocument';
export const RUNTIME_DOCUMENT_COLLECTION = 'runtime_documents';

export const RuntimeDocumentSchema = new Schema(
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
    documentNo: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      required: false,
    },
    data: {
      type: Schema.Types.Mixed,
      required: true,
      default: {},
    },
    metadataVersion: {
      type: Number,
      required: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
    updatedBy: {
      type: String,
      required: false,
    },
  },
  {
    collection: RUNTIME_DOCUMENT_COLLECTION,
    timestamps: true,
  },
);

RuntimeDocumentSchema.index({
  tenantId: 1,
  domainCode: 1,
  applicationCode: 1,
  entityCode: 1,
});
