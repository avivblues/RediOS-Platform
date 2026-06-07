import type {
  MobileNavigation,
  MobileQueryResult,
  MobileResolvedUIPage,
  MobileRuntimeActionRequest,
  MobileRuntimeContext,
  MobileRuntimeForm,
  MobileRuntimeTheme,
  MobileSyncBootstrapPackage,
  ResolvedSyncPolicy,
  RuntimeExperience,
} from './mobile-runtime-types';
import type { OfflineAction } from '../storage/offline-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_REDIOS_API_URL ?? 'http://localhost:3001/api';

export class MobileConflictResponseError extends Error {
  constructor(readonly conflictId: string) {
    super(`Offline action replay conflict: ${conflictId}`);
  }
}

export class MobileMetadataClient {
  constructor(private readonly context: MobileRuntimeContext) {}

  getExperience(entityCode: string): Promise<RuntimeExperience> {
    return this.get(`/experience/${entityCode}?platform=MOBILE`);
  }

  getPage(pageCode: string): Promise<MobileResolvedUIPage> {
    return this.get(`/ui/pages/${pageCode}`);
  }

  getForm(entityCode: string): Promise<MobileRuntimeForm> {
    return this.get(`/forms/${entityCode}`);
  }

  getNavigation(navigationCode?: string): Promise<MobileNavigation> {
    return this.get(navigationCode ? `/navigation/${navigationCode}` : '/navigation/current');
  }

  getTheme(themeCode?: string): Promise<MobileRuntimeTheme> {
    return this.get(themeCode ? `/themes/${themeCode}` : '/themes/current');
  }

  getSyncPolicies(): Promise<ResolvedSyncPolicy[]> {
    return this.get('/sync/policies');
  }

  bootstrapSync(deviceId: string, metadataVersion?: number): Promise<MobileSyncBootstrapPackage> {
    return this.post('/sync/bootstrap', {
      deviceId,
      metadataVersion,
    });
  }

  query(entityCode: string, viewCode?: string): Promise<MobileQueryResult> {
    return this.post(`/query/${entityCode}`, {
      ...(viewCode ? { viewCode } : {}),
    });
  }

  runAction(request: MobileRuntimeActionRequest): Promise<unknown> {
    if (!request.documentId) {
      return Promise.reject(new Error('Runtime action requires a document id.'));
    }

    return this.post(`/runtime/${request.entityCode}/${request.documentId}/actions/${request.actionCode}`, request.data);
  }

  replayOfflineAction(action: OfflineAction): Promise<unknown> {
    if (!action.documentId) {
      return Promise.reject(new Error('Offline replay requires a document id.'));
    }

    return this.post(`/runtime/${action.entityCode}/${action.documentId}/actions/${action.actionCode}`, {
      source: 'OFFLINE_SYNC',
      payload: action.payload,
      clientVersion: action.clientVersion,
      serverVersion: action.serverVersion,
      clientData: action.clientData,
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
      if (response.status === 409) {
        const body = (await response.json().catch(() => undefined)) as { conflictId?: string } | undefined;
        throw new MobileConflictResponseError(body?.conflictId ?? 'unknown');
      }

      throw new Error(`Mobile metadata request failed: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<TResponse>;
  }
}

export function createMobileMetadataClient(context: MobileRuntimeContext): MobileMetadataClient {
  return new MobileMetadataClient(context);
}
