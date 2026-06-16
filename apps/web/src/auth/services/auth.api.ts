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

export async function register(payload: RegisterRequest): Promise<RegisterResponse> {
  try {
    const response = await fetch('/api/auth/register', {
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
    // Backend auth endpoint is intentionally optional in this phase.
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
