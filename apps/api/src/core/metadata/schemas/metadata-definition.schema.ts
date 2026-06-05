import { Schema } from 'mongoose';

export const METADATA_DEFINITION_MODEL = 'MetadataDefinition';
export const METADATA_DEFINITION_COLLECTION = 'metadata_definitions';

export const MetadataDefinitionSchema = new Schema(
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
    type: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    version: {
      type: Number,
      required: true,
    },
    enabled: {
      type: Boolean,
      required: true,
      default: true,
    },
    definition: {
      type: Schema.Types.Mixed,
      required: true,
      default: {},
    },
  },
  {
    collection: METADATA_DEFINITION_COLLECTION,
    timestamps: true,
  },
);

MetadataDefinitionSchema.index({
  tenantId: 1,
  domainCode: 1,
  applicationCode: 1,
  type: 1,
  code: 1,
  version: 1,
});
