import { Module } from '@nestjs/common';
import { MetadataModule } from '../metadata/metadata.module';
import { HTTPConnectorAdapter } from './adapters/http-connector.adapter';
import { WebhookAdapter } from './adapters/webhook.adapter';
import { ConnectorEngine } from './connector-engine.service';
import { IntegrationEngine } from './integration-engine.service';
import { MappingEngine } from './mapping-engine.service';
import { RetryPolicy } from './retry-policy.service';
import { SecretProvider } from './secret-provider.service';

@Module({
  imports: [MetadataModule],
  providers: [
    HTTPConnectorAdapter,
    WebhookAdapter,
    ConnectorEngine,
    IntegrationEngine,
    MappingEngine,
    RetryPolicy,
    SecretProvider,
  ],
  exports: [ConnectorEngine, IntegrationEngine, MappingEngine, RetryPolicy, SecretProvider],
})
export class IntegrationModule {}
