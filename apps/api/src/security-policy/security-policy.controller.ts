import { Body, Controller, Get, Headers, Post, Query } from '@nestjs/common';
import type { SecurityPolicyTargetDefinition } from '@redios/shared';
import { ContextEngine, type RuntimeHeaders } from '../core/context/context.engine';
import { SecurityPolicyEngine, type SecurityPolicyEvaluation } from '../core/security-policy/security-policy-engine.service';

type SecurityPolicySimulationRequest = {
  entityCode: string;
  fieldCodes?: string[];
  actionCodes?: string[];
};

@Controller('security-policy')
export class SecurityPolicyController {
  constructor(
    private readonly contextEngine: ContextEngine,
    private readonly securityPolicyEngine: SecurityPolicyEngine,
  ) {}

  @Get('evaluate')
  evaluate(
    @Headers() headers: RuntimeHeaders,
    @Query('type') type: SecurityPolicyTargetDefinition['type'],
    @Query('code') code: string,
    @Query('entityCode') entityCode?: string,
  ): Promise<SecurityPolicyEvaluation> {
    return this.securityPolicyEngine.evaluate(this.contextEngine.resolve(headers), {
      type,
      code,
      entityCode,
    });
  }

  @Post('simulate')
  simulate(@Headers() headers: RuntimeHeaders, @Body() request: SecurityPolicySimulationRequest) {
    return this.securityPolicyEngine.summarizeEntityAccess(
      this.contextEngine.resolve(headers),
      request.entityCode,
      request.fieldCodes ?? [],
      request.actionCodes ?? [],
    );
  }
}
