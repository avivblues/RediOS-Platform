export type RuntimePackageStatus = 'BUILDING' | 'ACTIVE' | 'EXPIRED' | 'FAILED';

export interface CompiledWorkflowDefinition {
  code: string;
  statesByCode: Record<string, unknown>;
  transitionMap: Record<
    string,
    {
      next: string;
      transitionCode: string;
      actionCode: string;
    }
  >;
  source: unknown;
}

export interface RuntimePackageContent {
  entities: Record<string, unknown>;
  actions: Record<string, unknown>;
  fields: Record<string, unknown>;
  workflows: Record<string, CompiledWorkflowDefinition>;
  processes: Record<string, unknown>;
  businessRules: Record<string, unknown>;
  events: Record<string, unknown>;
  ledgers: Record<string, unknown>;
  relations: Record<string, unknown>;
  views: Record<string, unknown>;
  forms: Record<string, unknown>;
  ui: Record<string, unknown>;
  securityPolicies: Record<string, unknown>;
  themes: Record<string, unknown>;
  navigation: Record<string, unknown>;
  integrations: Record<string, unknown>;
  connectors: Record<string, unknown>;
  eventIntegrationMap: Record<string, string[]>;
  rolePolicyMap: Record<string, string[]>;
  fieldPolicyMap: Record<string, string[]>;
}

export interface RuntimePackageDefinition {
  code: string;
  tenantId: string;
  domainCode?: string;
  applicationCode: string;
  metadataVersion: number;
  compiledAt: Date;
  checksum: string;
  status: RuntimePackageStatus;
  content: RuntimePackageContent;
}

export interface RuntimeProjectionProvider {
  project(packageDefinition: RuntimePackageDefinition): Promise<void> | void;
}
