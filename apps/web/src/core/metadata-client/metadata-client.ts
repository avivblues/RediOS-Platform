import type {
  QueryResult,
  ResolvedUIPage,
  RuntimeContext,
  RuntimeForm,
  RuntimeExperience,
  RuntimeNavigation,
  RuntimeTheme,
} from '../renderer/runtime-types';
import { buildAuthHeaders } from '../../auth/session';

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

  createObject(objectCode: string, data: Record<string, unknown>): Promise<unknown> {
    return this.post(`/runtime/object/${objectCode}`, { data });
  }

  findObjects(objectCode: string, query?: Record<string, unknown>): Promise<Array<Record<string, unknown>>> {
    const params = query ? `?${new URLSearchParams(stringRecord(query)).toString()}` : '';
    return this.get(`/runtime/object/${objectCode}${params}`);
  }

  getObject(objectCode: string, id: string): Promise<Record<string, unknown> | null> {
    return this.get(`/runtime/object/${objectCode}/${id}`);
  }

  updateObject(objectCode: string, id: string, data: Record<string, unknown>): Promise<unknown> {
    return this.request(`/runtime/object/${objectCode}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ data }),
    });
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
        ...buildAuthHeaders(),
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

function stringRecord(value: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, String(item)]));
}
