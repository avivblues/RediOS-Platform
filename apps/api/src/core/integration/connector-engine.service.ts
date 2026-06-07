import { BadRequestException, Injectable } from '@nestjs/common';
import type { ConnectorDefinition } from '@redios/shared';
import { HTTPConnectorAdapter } from './adapters/http-connector.adapter';
import { WebhookAdapter } from './adapters/webhook.adapter';
import type { ConnectorExecutionResult } from './adapters/connector-adapter.interface';
import { SecretProvider } from './secret-provider.service';

@Injectable()
export class ConnectorEngine {
  constructor(
    private readonly httpAdapter: HTTPConnectorAdapter,
    private readonly webhookAdapter: WebhookAdapter,
    private readonly secretProvider: SecretProvider,
  ) {}

  execute(connector: ConnectorDefinition, payload: Record<string, unknown>): Promise<ConnectorExecutionResult> {
    const adapter = [this.httpAdapter, this.webhookAdapter].find((candidate) => candidate.supports(connector));

    if (!adapter) {
      throw new BadRequestException(`Connector type ${connector.type} is not supported by the foundation adapters.`);
    }

    return adapter.execute(connector, payload, this.secretProvider.getSecret(connector.secretCode));
  }
}
