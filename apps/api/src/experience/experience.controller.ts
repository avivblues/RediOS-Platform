import { Controller, Get, Headers, Param, Query } from '@nestjs/common';
import type { ExperiencePlatform, ResolvedExperience } from '@redios/shared';
import { ContextEngine, type RuntimeHeaders } from '../core/context/context.engine';
import { ExperienceEngine } from '../core/experience/experience-engine.service';

@Controller('experience')
export class ExperienceController {
  constructor(
    private readonly contextEngine: ContextEngine,
    private readonly experienceEngine: ExperienceEngine,
  ) {}

  @Get(':entityCode')
  resolve(
    @Headers() headers: RuntimeHeaders,
    @Param('entityCode') entityCode: string,
    @Query('platform') platform?: ExperiencePlatform,
    @Query('device') device?: string,
  ): Promise<ResolvedExperience> {
    return this.experienceEngine.resolveExperience(this.contextEngine.resolve(headers), entityCode, {
      platform,
      device,
    });
  }
}
