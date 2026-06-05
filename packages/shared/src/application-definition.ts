export interface ApplicationDefinition {
  code: string;
  name: string;
  description?: string;
  capabilities: string[];
  entityCodes: string[];
  enabled: boolean;
}
