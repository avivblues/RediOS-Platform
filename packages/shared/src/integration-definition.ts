export type IntegrationTriggerType = 'EVENT' | 'WORKFLOW' | 'MANUAL' | 'SCHEDULE';

export type ConnectorType = 'HTTP' | 'WEBHOOK' | 'EMAIL' | 'MESSAGE_QUEUE' | 'CUSTOM';

export type ConnectorAuthType = 'NONE' | 'OAUTH2' | 'API_KEY' | 'TOKEN';

export interface IntegrationTriggerDefinition {
  type: IntegrationTriggerType;
  sourceCode?: string;
}

export interface IntegrationConnectorBinding {
  type: ConnectorType;
  connectorCode: string;
}

export interface IntegrationMappingDefinition {
  input: Record<string, string>;
  output: Record<string, string>;
}

export interface IntegrationErrorPolicyDefinition {
  retry: boolean;
  maxAttempts: number;
  fallback?: string;
  delayMs?: number;
}

export interface IntegrationDefinition {
  code: string;
  name: string;
  enabled: boolean;
  version: number;
  trigger: IntegrationTriggerDefinition;
  connector: IntegrationConnectorBinding;
  mapping: IntegrationMappingDefinition;
  errorPolicy: IntegrationErrorPolicyDefinition;
}

export interface ConnectorDefinition {
  code: string;
  type: Extract<ConnectorType, 'HTTP' | 'WEBHOOK'> | ConnectorType;
  configSchema: Record<string, unknown>;
  authType: ConnectorAuthType;
  secretCode?: string;
  enabled: boolean;
  version: number;
}

export interface IntegrationExecutionEvent {
  code: string;
  type: IntegrationTriggerType;
  sourceCode?: string;
  payload: Record<string, unknown>;
}

export interface IntegrationExecutionResult {
  code: string;
  trigger: IntegrationTriggerType;
  connector: ConnectorType;
  connectorCode: string;
  status: 'READY' | 'SUCCESS' | 'FAILED';
  attempts: number;
  output?: unknown;
  error?: string;
}
