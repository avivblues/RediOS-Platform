export type PlatformPersona = 'SYSTEM_ADMIN' | 'PROGRAMMER' | 'MANAGER' | 'STAFF';

export interface ResolvedPersona {
  persona: PlatformPersona;
  label: string;
  description: string;
  workspaceCode: string;
  homeRoute: string;
  applicationCode: string;
  capabilities: string[];
  sourceRoles: string[];
}
