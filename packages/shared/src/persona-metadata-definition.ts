import type { PlatformPersona } from './persona-definition';

export interface PersonaMetadataDefinition {
  persona: PlatformPersona;
  label: string;
  description: string;
  workspaceCode: string;
  homeRoute: string;
  applicationCode: string;
  capabilities: string[];
}
