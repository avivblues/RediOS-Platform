export interface RuntimeContext {
  userId: string;
  tenantId: string;
  domainCode: string;
  applicationCode: string;
  permissions: string[];
  capabilities: string[];
  roles?: string[];
  groups?: string[];
  attributes?: Record<string, unknown>;
}
