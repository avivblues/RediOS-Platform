import { Injectable } from '@nestjs/common';
import type { ConnectorDefinition } from '@redios/shared';
import type { ConnectorAdapter, ConnectorExecutionResult } from './connector-adapter.interface';

@Injectable()
export class WebhookAdapter implements ConnectorAdapter {
  supports(connector: ConnectorDefinition): boolean {
    return connector.type === 'WEBHOOK';
  }

  async execute(connector: ConnectorDefinition, payload: Record<string, unknown>, secret?: string): Promise<ConnectorExecutionResult> {
    return {
      status: 'CONNECTOR_EXECUTED',
      connectorCode: connector.code,
      type: connector.type,
      output: {
        endpoint: this.schemaString(connector, 'endpoint', 'metadata://webhook-endpoint'),
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
