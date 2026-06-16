import { Schema } from 'mongoose';

export const PLATFORM_APPLICATION_MODEL = 'PlatformApplication';
export const PLATFORM_APPLICATION_COLLECTION = 'platform_applications';

export const PlatformApplicationSchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: { type: String, required: true, default: 'SYSTEM' },
    status: { type: String, required: true, default: 'ACTIVE' },
    features: { type: [String], required: true, default: [] },
  },
  {
    collection: PLATFORM_APPLICATION_COLLECTION,
    timestamps: true,
  },
);

PlatformApplicationSchema.index({ code: 1 }, { unique: true });
