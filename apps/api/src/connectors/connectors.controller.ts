import { Body, Controller, Headers, Inject, NotFoundException, Post } from '@nestjs/common';
import type { ConnectorDefinition } from '@redios/shared';
import { ConnectorEngine } from '../core/integration/connector-engine.service';
import { ContextEngine, type RuntimeHeaders } from '../core/context/context.engine';
import { METADATA_PROVIDER, type MetadataProvider } from '../core/metadata/metadata-provider.interface';

interface ConnectorTestRequest {
  connectorCode: string;
  payload?: Record<string, unknown>;
}

@Controller('connectors')
export class ConnectorsController {
  constructor(
    private readonly contextEngine: ContextEngine,
    private readonly connectorEngine: ConnectorEngine,
    @Inject(METADATA_PROVIDER) private readonly metadataProvider: MetadataProvider,
  ) {}

  @Post('test')
  async test(@Headers() headers: RuntimeHeaders, @Body() request: ConnectorTestRequest) {
    const context = this.contextEngine.resolve(headers);
    const metadata = await this.metadataProvider.findOne(context, {
      type: 'CONNECTOR',
      code: request.connectorCode,
      enabledOnly: true,
    });

    if (!metadata) {
      throw new NotFoundException(`Connector ${request.connectorCode} was not found.`);
    }

    return this.connectorEngine.execute(metadata.definition as ConnectorDefinition, request.payload ?? {});
  }
}
