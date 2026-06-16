import { Schema } from 'mongoose';

export const CUSTOM_FIELD_VALUE_MODEL = 'CustomFieldValue';
export const CUSTOM_FIELD_VALUE_COLLECTION = 'custom_field_values';

export const CustomFieldValueSchema = new Schema(
  {
    tenantId: { type: String, required: true },
    entity: { type: String, required: true },
    recordId: { type: String, required: true },
    fieldId: { type: String, required: true },
    value: { type: Schema.Types.Mixed, required: false },
  },
  {
    collection: CUSTOM_FIELD_VALUE_COLLECTION,
    timestamps: true,
  },
);

CustomFieldValueSchema.index({ tenantId: 1, entity: 1, recordId: 1, fieldId: 1 }, { unique: true });
