import type { RuntimeContext } from '@redios/shared';

export interface IdentityJwtPayload {
  sub: string;
  email: string;
  tenantId: string;
  domainCode: string;
  applicationCode: string;
  roles: string[];
  permissions: string[];
  displayName?: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  displayName: string;
  tenantId: string;
  status: string;
  roleCodes: string[];
}

export interface LoginResult {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
  user: {
    id: string;
    email: string;
    displayName: string;
    roles: string[];
  };
  context: RuntimeContext;
}

export interface MeResult {
  user: {
    id: string;
    email: string;
    displayName: string;
    status: string;
    roles: string[];
  };
  context: RuntimeContext;
}
