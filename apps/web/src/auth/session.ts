import type { IdentitySession } from '../identity/identity-engine';

const SESSION_KEY = 'redios:identity:session';

export function readAuthSession(): IdentitySession | undefined {
  try {
    const rawValue = window.localStorage.getItem(SESSION_KEY);
    return rawValue ? JSON.parse(rawValue) as IdentitySession : undefined;
  } catch {
    return undefined;
  }
}

export function writeAuthSession(session: IdentitySession) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearAuthSession() {
  window.localStorage.removeItem(SESSION_KEY);
}

export function redirectToLoginIfUnauthorized(response: Response): boolean {
  if (response.status !== 401) {
    return false;
  }

  clearAuthSession();
  window.location.href = '/login';
  return true;
}

export function buildAuthHeaders(session?: IdentitySession): Record<string, string> {
  const current = session ?? readAuthSession();
  if (!current) {
    return {};
  }

  const headers: Record<string, string> = {
    'x-tenant-id': current.tenantId,
    'x-domain-code': current.domainCode,
    'x-application-code': current.applicationCode,
    'x-user-id': current.userId,
    'x-permissions': current.permissions.join(','),
    'x-roles': current.roles.join(','),
  };

  if (current.accessToken) {
    headers.authorization = `Bearer ${current.accessToken}`;
  }

  return headers;
}
