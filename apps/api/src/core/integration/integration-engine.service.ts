import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type {
  ConnectorDefinition,
  IntegrationDefinition,
  IntegrationExecutionEvent,
  IntegrationExecutionResult,
  MetadataDefinition,
  RuntimeContext,
} from '@redios/shared';
import { METADATA_PROVIDER, type MetadataProvider } from '../metadata/metadata-provider.interface';
import { ConnectorEngine } from './connector-engine.service';
import { MappingEngine } from './mapping-engine.service';
import { RetryPolicy } from './retry-policy.service';

@Injectable()
export class IntegrationEngine {
  constructor(
    @Inject(METADATA_PROVIDER) private readonly metadataProvider: MetadataProvider,
    private readonly connectorEngine: ConnectorEngine,
    private readonly mappingEngine: MappingEngine,
    private readonly retryPolicy: RetryPolicy,
  ) {}

  async list(context: RuntimeContext): Promise<MetadataDefinition<IntegrationDefinition>[]> {
    const metadata = await this.metadataProvider.findMetadata(context, {
      type: 'INTEGRATION',
      enabledOnly: true,
    });
    return metadata as MetadataDefinition<IntegrationDefinition>[];
  }

  async execute(context: RuntimeContext, event: IntegrationExecutionEvent): Promise<IntegrationExecutionResult[]> {
    const integrations = (await this.metadataProvider.findMetadata(context, {
      type: 'INTEGRATION',
      enabledOnly: true,
    })) as MetadataDefinition<IntegrationDefinition>[];
    const matching = integrations.filter((metadata) => this.matches(metadata.definition, event));

    const results: IntegrationExecutionResult[] = [];

    for (const integrationMetadata of matching) {
      results.push(await this.executeOne(context, integrationMetadata.definition, event));
    }

    return results;
  }

  async test(context: RuntimeContext, integrationCode: string, payload: Record<string, unknown>): Promise<IntegrationExecutionResult> {
    const metadata = await this.metadataProvider.findOne(context, {
      type: 'INTEGRATION',
      code: integrationCode,
      enabledOnly: true,
    });

    if (!metadata) {
      throw new NotFoundException(`Integration ${integrationCode} was not found.`);
    }

    const integration = metadata.definition as IntegrationDefinition;
    return this.executeOne(context, integration, {
      code: integration.trigger.sourceCode ?? integration.code,
      type: integration.trigger.type,
      sourceCode: integration.trigger.sourceCode,
      payload,
    });
  }

  private async executeOne(
    context: RuntimeContext,
    integration: IntegrationDefinition,
    event: IntegrationExecutionEvent,
  ): Promise<IntegrationExecutionResult> {
    const connector = await this.resolveConnector(context, integration.connector.connectorCode);
    const payload = this.mappingEngine.apply(integration.mapping, event.payload);
    const attempts = this.retryPolicy.attempts(integration.errorPolicy);
    let lastError: string | undefined;

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        const output = await this.connectorEngine.execute(connector.definition, payload);
        return {
          code: integration.code,
          trigger: integration.trigger.type,
          connector: connector.definition.type,
          connectorCode: connector.definition.code,
          status: output.status === 'CONNECTOR_EXECUTED' ? 'SUCCESS' : 'FAILED',
          attempts: attempt,
          output,
        };
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);
      }
    }

    return {
      code: integration.code,
      trigger: integration.trigger.type,
      connector: integration.connector.type,
      connectorCode: integration.connector.connectorCode,
      status: 'FAILED',
      attempts,
      error: lastError,
    };
  }

  private async resolveConnector(
    context: RuntimeContext,
    connectorCode: string,
  ): Promise<MetadataDefinition<ConnectorDefinition>> {
    const connector = await this.metadataProvider.findOne(context, {
      type: 'CONNECTOR',
      code: connectorCode,
      enabledOnly: true,
    });

    if (!connector) {
      throw new NotFoundException(`Connector ${connectorCode} was not found.`);
    }

    return connector as MetadataDefinition<ConnectorDefinition>;
  }

  private matches(integration: IntegrationDefinition, event: IntegrationExecutionEvent): boolean {
    return (
      integration.enabled &&
      integration.trigger.type === event.type &&
      (!integration.trigger.sourceCode || integration.trigger.sourceCode === event.sourceCode || integration.trigger.sourceCode === event.code)
    );
  }
}
