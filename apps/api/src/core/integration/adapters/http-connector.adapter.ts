import { Injectable } from '@nestjs/common';
import type { ConnectorDefinition } from '@redios/shared';
import type { ConnectorAdapter, ConnectorExecutionResult } from './connector-adapter.interface';

@Injectable()
export class HTTPConnectorAdapter implements ConnectorAdapter {
  supports(connector: ConnectorDefinition): boolean {
    return connector.type === 'HTTP';
  }

  async execute(connector: ConnectorDefinition, payload: Record<string, unknown>, secret?: string): Promise<ConnectorExecutionResult> {
    return {
      status: 'CONNECTOR_EXECUTED',
      connectorCode: connector.code,
      type: connector.type,
      output: {
        method: this.schemaString(connector, 'method', 'POST'),
        url: this.schemaString(connector, 'url', 'metadata://connector-url'),
        authApplied: Boolean(secret),
        payload,
      },
    };
  }

  private schemaString(connector: ConnectorDefinition, key: string, fallback: string): string {
    const value = connector.configSchema[key];
    return typeof value === 'string' ? value : fallback;
  }
}
