import { Schema } from 'mongoose';

export const PLATFORM_TENANT_MODEL = 'PlatformTenant';
export const PLATFORM_TENANT_COLLECTION = 'platform_tenants';

export const PlatformTenantSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    status: { type: String, required: true, default: 'ACTIVE' },
  },
  {
    collection: PLATFORM_TENANT_COLLECTION,
    timestamps: true,
  },
);
