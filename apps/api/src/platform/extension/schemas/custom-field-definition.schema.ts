import { Schema } from 'mongoose';

export const CUSTOM_FIELD_DEFINITION_MODEL = 'CustomFieldDefinition';
export const CUSTOM_FIELD_DEFINITION_COLLECTION = 'custom_field_definitions';

export const CustomFieldDefinitionSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    tenantId: { type: String, required: true },
    entity: { type: String, required: true },
    fieldName: { type: String, required: true },
    label: { type: String, required: false },
    dataType: { type: String, required: true },
    createdBy: { type: String, required: true },
    options: { type: [String], required: false, default: [] },
  },
  {
    collection: CUSTOM_FIELD_DEFINITION_COLLECTION,
    timestamps: true,
  },
);

CustomFieldDefinitionSchema.index({ tenantId: 1, entity: 1, fieldName: 1 }, { unique: true });
