import type {
  QueryResult,
  ResolvedUIPage,
  RuntimeContext,
  RuntimeForm,
  RuntimeExperience,
  RuntimeNavigation,
  RuntimeTheme,
} from '../renderer/runtime-types';

const API_BASE_URL = import.meta.env.VITE_REDIOS_API_URL ?? '/api';

export interface RuntimeActionRequest {
  entityCode: string;
  documentId: string;
  actionCode: string;
  payload?: Record<string, unknown>;
}

export class MetadataClient {
  constructor(private readonly context: RuntimeContext) {}

  getPage(pageCode: string): Promise<ResolvedUIPage> {
    return this.get(`/ui/pages/${pageCode}`);
  }

  getExperience(entityCode: string, platform: RuntimeExperience['platform'] = 'WEB'): Promise<RuntimeExperience> {
    return this.get(`/experience/${entityCode}?platform=${platform}`);
  }

  getForm(entityCode: string): Promise<RuntimeForm> {
    return this.get(`/forms/${entityCode}`);
  }

  getNavigation(navigationCode?: string): Promise<RuntimeNavigation> {
    return this.get(navigationCode ? `/navigation/${navigationCode}` : '/navigation/current');
  }

  getTheme(themeCode?: string): Promise<RuntimeTheme> {
    return this.get(themeCode ? `/themes/${themeCode}` : '/themes/current');
  }

  query(entityCode: string, viewCode?: string): Promise<QueryResult> {
    return this.post(`/query/${entityCode}`, {
      ...(viewCode ? { viewCode } : {}),
    });
  }

  runAction(request: RuntimeActionRequest): Promise<unknown> {
    return this.post(`/runtime/${request.entityCode}/${request.documentId}/actions/${request.actionCode}`, request.payload ?? {});
  }

  private get<TResponse>(path: string): Promise<TResponse> {
    return this.request<TResponse>(path);
  }

  private post<TResponse>(path: string, body: unknown): Promise<TResponse> {
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
      throw new Error(`Metadata request failed: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<TResponse>;
  }
}

export function createMetadataClient(context: RuntimeContext): MetadataClient {
  return new MetadataClient(context);
}
