import { Schema } from 'mongoose';

export const CAPABILITY_DEFINITION_MODEL = 'CapabilityDefinition';
export const CAPABILITY_DEFINITION_COLLECTION = 'capability_definitions';

export const CapabilityDefinitionSchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    module: { type: String, required: true },
    inputSchema: { type: Schema.Types.Mixed, required: true, default: {} },
    outputSchema: { type: Schema.Types.Mixed, required: true, default: {} },
    description: { type: String, required: false },
    implementationStatus: { type: String, required: true, default: 'CONTRACT' },
    handlerRef: { type: String, required: false },
  },
  {
    collection: CAPABILITY_DEFINITION_COLLECTION,
    timestamps: true,
  },
);

CapabilityDefinitionSchema.index({ module: 1 });
