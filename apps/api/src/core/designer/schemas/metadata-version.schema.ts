import { Schema } from 'mongoose';

export const METADATA_VERSION_MODEL = 'MetadataVersion';
export const METADATA_VERSION_COLLECTION = 'metadata_versions';

export const MetadataVersionSchema = new Schema(
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
    version: {
      type: Number,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      required: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
  },
  {
    collection: METADATA_VERSION_COLLECTION,
    timestamps: true,
  },
);

MetadataVersionSchema.index({
  tenantId: 1,
  domainCode: 1,
  applicationCode: 1,
  targetType: 1,
  targetCode: 1,
  version: 1,
});
