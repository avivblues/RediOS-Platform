export type PlatformEntityStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface PlatformTenant {
  id: string;
  code: string;
  name: string;
  status: PlatformEntityStatus;
}

export interface PlatformUser {
  id: string;
  tenantId: string;
  email: string;
  passwordHash: string;
  displayName?: string;
  status: PlatformEntityStatus;
  roleCodes: string[];
}

export interface PlatformRole {
  code: string;
  name: string;
  purpose: string;
  permissions: string[];
}

export interface PlatformApplication {
  code: string;
  name: string;
  type: 'SYSTEM' | 'BUSINESS';
  status: PlatformEntityStatus;
  features: string[];
}
