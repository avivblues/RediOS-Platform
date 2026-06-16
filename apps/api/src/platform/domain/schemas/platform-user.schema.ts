import { Schema } from 'mongoose';

export const PLATFORM_USER_MODEL = 'PlatformUser';
export const PLATFORM_USER_COLLECTION = 'platform_users';

export const PlatformUserSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    tenantId: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    displayName: { type: String, required: false },
    status: { type: String, required: true, default: 'ACTIVE' },
    roleCodes: { type: [String], required: true, default: [] },
  },
  {
    collection: PLATFORM_USER_COLLECTION,
    timestamps: true,
  },
);

PlatformUserSchema.index({ tenantId: 1, email: 1 }, { unique: true });
