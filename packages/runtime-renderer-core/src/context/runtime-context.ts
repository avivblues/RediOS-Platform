export type RuntimeRendererPlatform = 'WEB' | 'MOBILE' | 'TABLET';

export interface RuntimeRendererContext {
  tenantId: string;
  domainCode: string;
  applicationCode: string;
  userId: string;
  roles: string[];
  groups: string[];
  attributes: Record<string, unknown>;
  platform: RuntimeRendererPlatform;
}

export interface RuntimeDocumentState {
  id?: string;
  data: Record<string, unknown>;
}
