export interface RuntimeContext {
  userId: string;
  tenantId: string;
  domainCode: string;
  applicationCode: string;
  permissions: string[];
  capabilities: string[];
}
