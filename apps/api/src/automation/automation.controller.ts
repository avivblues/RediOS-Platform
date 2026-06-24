import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ContextEngine, type RuntimeHeaders } from '../core/context/context.engine';
import { AutomationEngine } from '../core/tunasflow/automation/automation.engine';

@ApiTags('Automation')
@Controller('automation')
export class AutomationController {
  constructor(
    private readonly contextEngine: ContextEngine,
    private readonly automationEngine: AutomationEngine,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List enabled automations for the current tenant.' })
  list(@Headers() headers: RuntimeHeaders) {
    return this.automationEngine.listAutomations(this.contextEngine.resolve(headers));
  }

  @Post(':code/trigger')
  @ApiOperation({ summary: 'Manually trigger an automation (API trigger).' })
  trigger(
    @Headers() headers: RuntimeHeaders,
    @Param('code') code: string,
    @Body() body: { documentId?: string; entityCode?: string },
  ) {
    const context = this.contextEngine.resolve(headers);
    const document = body.documentId
      ? {
          id: body.documentId,
          tenantId: context.tenantId,
          domainCode: context.domainCode,
          applicationCode: context.applicationCode,
          entityCode: body.entityCode ?? '',
          data: {},
          metadataVersion: 1,
          createdBy: context.userId ?? 'system',
        }
      : undefined;

    return this.automationEngine.runAutomation(context, code, document);
  }
}
