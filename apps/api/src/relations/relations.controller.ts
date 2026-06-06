import { Controller, Get, Headers, Param } from '@nestjs/common';
import { ContextEngine, type RuntimeHeaders } from '../core/context/context.engine';
import { RelationEngine, type RelationResolveResult } from '../core/relation/relation-engine.service';

@Controller('relations')
export class RelationsController {
  constructor(
    private readonly contextEngine: ContextEngine,
    private readonly relationEngine: RelationEngine,
  ) {}

  @Get(':entityCode')
  resolve(
    @Headers() headers: RuntimeHeaders,
    @Param('entityCode') entityCode: string,
  ): Promise<RelationResolveResult> {
    return this.relationEngine.resolve(this.contextEngine.resolve(headers), entityCode);
  }
}
