import type { ApiClient } from './api-client';

export interface SimulationRequest {
  tenantId: string;
  domainCode: string;
  applicationCode: string;
  entityCode: string;
  actionCode: string;
  currentState?: string;
  platform?: 'WEB' | 'MOBILE' | 'TABLET';
  permissions?: string[];
  roles?: string[];
  payload?: Record<string, unknown>;
  mockDocument?: Record<string, unknown>;
}

export class RuntimeClient {
  constructor(private readonly api: ApiClient) {}

  simulate(request: SimulationRequest): Promise<unknown> {
    return this.api.post('/simulation/run', request);
  }

  analyzeDependency(type: string, code: string): Promise<unknown> {
    return this.api.get(`/dependencies/${type}/${code}`);
  }

  testIntegration(integrationCode: string, payload: Record<string, unknown>): Promise<unknown> {
    return this.api.post('/integrations/test', {
      integrationCode,
      payload,
    });
  }

  testConnector(connectorCode: string, payload: Record<string, unknown>): Promise<unknown> {
    return this.api.post('/connectors/test', {
      connectorCode,
      payload,
    });
  }
}
