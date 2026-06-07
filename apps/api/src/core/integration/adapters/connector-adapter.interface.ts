import type { ConnectorDefinition } from '@redios/shared';

export interface ConnectorExecutionResult {
  status: 'CONNECTOR_EXECUTED' | 'CONNECTOR_FAILED';
  connectorCode: string;
  type: ConnectorDefinition['type'];
  output?: unknown;
  error?: string;
}

export interface ConnectorAdapter {
  supports(connector: ConnectorDefinition): boolean;
  execute(connector: ConnectorDefinition, payload: Record<string, unknown>, secret?: string): Promise<ConnectorExecutionResult>;
}
