import { Schema } from 'mongoose';

export const METADATA_DRAFT_MODEL = 'MetadataDraft';
export const METADATA_DRAFT_COLLECTION = 'metadata_drafts';

export const MetadataDraftSchema = new Schema(
  {
    tenantId: {
      type: String,
      required: true,
    },
    domainCode: {
      type: String,
      required: false,
    },
    applicationCode: {
      type: String,
      required: true,
    },
    sourceMetadataId: {
      type: String,
      required: false,
    },
    targetType: {
      type: String,
      required: true,
    },
    targetCode: {
      type: String,
      required: true,
    },
    entityCode: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      required: true,
      default: 'DRAFT',
    },
    draft: {
      type: Schema.Types.Mixed,
      required: true,
    },
    changes: {
      type: [Schema.Types.Mixed],
      required: true,
      default: [],
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
    collection: METADATA_DRAFT_COLLECTION,
    timestamps: true,
  },
);

MetadataDraftSchema.index({
  tenantId: 1,
  domainCode: 1,
  applicationCode: 1,
  targetType: 1,
  targetCode: 1,
  status: 1,
});
