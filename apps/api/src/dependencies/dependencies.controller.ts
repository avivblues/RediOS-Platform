import { Controller, Get, Headers, Param } from '@nestjs/common';
import type { DependencyNodeType } from '@redios/shared';
import { ContextEngine, type RuntimeHeaders } from '../core/context/context.engine';
import { DependencyEngine } from '../core/dependency/dependency-engine.service';

@Controller('dependencies')
export class DependenciesController {
  constructor(
    private readonly contextEngine: ContextEngine,
    private readonly dependencyEngine: DependencyEngine,
  ) {}

  @Get(':type/:code')
  analyze(
    @Headers() headers: RuntimeHeaders,
    @Param('type') type: DependencyNodeType,
    @Param('code') code: string,
  ) {
    return this.dependencyEngine.analyzeImpact(this.contextEngine.resolve(headers), {
      type,
      code,
    });
  }
}
