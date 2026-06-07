import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { ContextEngine, type RuntimeHeaders } from '../core/context/context.engine';
import { IntegrationEngine } from '../core/integration/integration-engine.service';

interface IntegrationTestRequest {
  integrationCode: string;
  payload?: Record<string, unknown>;
}

@Controller('integrations')
export class IntegrationsController {
  constructor(
    private readonly contextEngine: ContextEngine,
    private readonly integrationEngine: IntegrationEngine,
  ) {}

  @Get()
  list(@Headers() headers: RuntimeHeaders) {
    return this.integrationEngine.list(this.contextEngine.resolve(headers));
  }

  @Post('test')
  test(@Headers() headers: RuntimeHeaders, @Body() request: IntegrationTestRequest) {
    return this.integrationEngine.test(this.contextEngine.resolve(headers), request.integrationCode, request.payload ?? {});
  }
}
