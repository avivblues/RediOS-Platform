import type { RuntimeContext } from '../renderer/runtime-types';

const API_BASE_URL = import.meta.env.VITE_REDIOS_API_URL ?? '/api';

export class ApiClient {
  constructor(private readonly context: RuntimeContext) {}

  get<TResponse>(path: string): Promise<TResponse> {
    return this.request<TResponse>(path);
  }

  post<TResponse>(path: string, body: unknown = {}): Promise<TResponse> {
    return this.request<TResponse>(path, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  private async request<TResponse>(path: string, init: RequestInit = {}): Promise<TResponse> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        'content-type': 'application/json',
        'x-tenant-id': this.context.tenantId,
        'x-domain-code': this.context.domainCode,
        'x-application-code': this.context.applicationCode,
        'x-user-id': this.context.userId,
        'x-permissions': this.context.permissions.join(','),
        'x-roles': this.context.roles.join(','),
        'x-groups': this.context.groups.join(','),
        'x-attributes': JSON.stringify(this.context.attributes),
        ...init.headers,
      },
    });

    if (!response.ok) {
      let detail: unknown;

      try {
        detail = await response.json();
      } catch {
        detail = await response.text().catch(() => undefined);
      }

      throw new ApiClientError(response.status, response.statusText, path, detail);
    }

    return response.json() as Promise<TResponse>;
  }
}

export class ApiClientError extends Error {
  constructor(
    readonly status: number,
    readonly statusText: string,
    readonly path: string,
    readonly detail: unknown,
  ) {
    super(`API returned ${status} ${statusText} for ${path}`);
  }
}

export function createApiClient(context: RuntimeContext): ApiClient {
  return new ApiClient(context);
}
