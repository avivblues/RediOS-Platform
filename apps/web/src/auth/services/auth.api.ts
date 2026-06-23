import { buildAuthHeaders } from '../session';

const API_BASE_URL = import.meta.env.VITE_REDIOS_API_URL ?? '/api';

export interface LoginRequest {
  email: string;
  password: string;
  domainCode?: string;
  applicationCode?: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
  user: {
    id: string;
    email: string;
    displayName: string;
    roles: string[];
  };
  context: {
    userId: string;
    tenantId: string;
    domainCode: string;
    applicationCode: string;
    permissions: string[];
    roles: string[];
    capabilities?: string[];
    groups?: string[];
    attributes?: Record<string, unknown>;
  };
}

export type MeResponse = {
  user: {
    id: string;
    email: string;
    displayName: string;
    status: string;
    roles: string[];
  };
  context: LoginResponse['context'];
};

export interface RegisterRequest {
  displayName: string;
  email: string;
  password: string;
  organizationName: string;
}

export interface RegisterResponse {
  userId: string;
  tenantId: string;
  status: 'PENDING_ACTIVATION';
}

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = 'Login failed.';
    try {
      const body = await response.json() as { message?: string | string[] };
      message = Array.isArray(body.message) ? body.message.join(', ') : (body.message ?? message);
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  return response.json() as Promise<LoginResponse>;
}

export async function getMe(): Promise<MeResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      ...buildAuthHeaders(),
    },
  });

  if (!response.ok) {
    let message = 'Failed to load profile.';
    try {
      const body = await response.json() as { message?: string | string[] };
      message = Array.isArray(body.message) ? body.message.join(', ') : (body.message ?? message);
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  return response.json() as Promise<MeResponse>;
}

export async function register(payload: RegisterRequest): Promise<RegisterResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      return response.json() as Promise<RegisterResponse>;
    }
  } catch {
    // Backend registration endpoint is optional in this phase.
  }

  return mockRegisterResponse(payload);
}

function mockRegisterResponse(payload: RegisterRequest): RegisterResponse {
  return {
    userId: `mock_user_${Date.now()}`,
    tenantId: `tenant_${slug(payload.organizationName)}`,
    status: 'PENDING_ACTIVATION',
  };
}

function slug(value: string) {
  return value.trim().replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'redios';
}
