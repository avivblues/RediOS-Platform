export type CapabilityModule =
  | 'IDENTITY'
  | 'TENANT'
  | 'METADATA'
  | 'BUILDER'
  | 'INVENTORY'
  | 'FINANCE'
  | 'SECURITY'
  | string;

export type CapabilityImplementationStatus = 'CONTRACT' | 'PLACEHOLDER' | 'IMPLEMENTED';

export interface CapabilitySchema {
  type?: string;
  properties?: Record<string, unknown>;
  required?: string[];
  [key: string]: unknown;
}

export interface CapabilityDefinition {
  code: string;
  name: string;
  module: CapabilityModule;
  inputSchema: CapabilitySchema;
  outputSchema: CapabilitySchema;
  description?: string;
  implementationStatus?: CapabilityImplementationStatus;
  handlerRef?: string;
  permissions?: string[];
}

export interface CapabilityExecutionRequest {
  capabilityCode: string;
  input: Record<string, unknown>;
  context: {
    tenantId: string;
    userId: string;
    domainCode?: string;
    applicationCode?: string;
  };
}

export interface CapabilityExecutionResult {
  capabilityCode: string;
  status: 'ACCEPTED' | 'NOT_IMPLEMENTED' | 'FAILED';
  output?: Record<string, unknown>;
  message?: string;
}
