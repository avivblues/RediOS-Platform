import { Schema } from 'mongoose';

export const PLATFORM_ROLE_MODEL = 'PlatformRole';
export const PLATFORM_ROLE_COLLECTION = 'platform_roles';

export const PlatformRoleSchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    purpose: { type: String, required: true },
    permissions: { type: [String], required: true, default: [] },
  },
  {
    collection: PLATFORM_ROLE_COLLECTION,
    timestamps: true,
  },
);

PlatformRoleSchema.index({ code: 1 }, { unique: true });
