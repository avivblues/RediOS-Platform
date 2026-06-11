import { Body, Controller, Get, Headers, Param, Post, Query } from '@nestjs/common';
import type { DesignerOperation } from '@redios/shared';
import { ContextEngine, type RuntimeHeaders } from '../core/context/context.engine';
import {
  DesignerEngine,
  type CreateDesignerDraftRequest,
  type DesignerPreviewResult,
  type DesignerPublishResult,
  type GeneratedMetadataPublishRequest,
  type GeneratedMetadataPublishResult,
  type GeneratedMetadataStageResult,
  type StudioHistoryEntry,
} from '../core/designer/designer-engine.service';

type RollbackRequest = {
  version: number;
};

@Controller('designer')
export class DesignerController {
  constructor(
    private readonly contextEngine: ContextEngine,
    private readonly designerEngine: DesignerEngine,
  ) {}

  @Post('drafts')
  createDraft(@Headers() headers: RuntimeHeaders, @Body() request: CreateDesignerDraftRequest) {
    return this.designerEngine.createDraft(this.contextEngine.resolve(headers), request);
  }

  @Post(':draftId/operations')
  applyOperation(
    @Headers() headers: RuntimeHeaders,
    @Param('draftId') draftId: string,
    @Body() operation: DesignerOperation,
  ) {
    return this.designerEngine.applyOperation(this.contextEngine.resolve(headers), draftId, operation);
  }

  @Post(':draftId/preview')
  preview(@Headers() headers: RuntimeHeaders, @Param('draftId') draftId: string): Promise<DesignerPreviewResult> {
    return this.designerEngine.preview(this.contextEngine.resolve(headers), draftId);
  }

  @Post('generated/publish')
  publishGenerated(
    @Headers() headers: RuntimeHeaders,
    @Body() request: GeneratedMetadataPublishRequest,
  ): Promise<GeneratedMetadataPublishResult> {
    return this.designerEngine.publishGeneratedMetadata(this.contextEngine.resolve(headers), request);
  }

  @Post('generated/stage')
  stageGenerated(
    @Headers() headers: RuntimeHeaders,
    @Body() request: GeneratedMetadataPublishRequest,
  ): Promise<GeneratedMetadataStageResult> {
    return this.designerEngine.stageGeneratedMetadata(this.contextEngine.resolve(headers), request);
  }

  @Post(':draftId/publish')
  publish(@Headers() headers: RuntimeHeaders, @Param('draftId') draftId: string): Promise<DesignerPublishResult> {
    return this.designerEngine.publish(this.contextEngine.resolve(headers), draftId);
  }

  @Post(':draftId/rollback')
  rollback(
    @Headers() headers: RuntimeHeaders,
    @Param('draftId') draftId: string,
    @Body() request: RollbackRequest,
  ): Promise<DesignerPublishResult> {
    return this.designerEngine.rollback(this.contextEngine.resolve(headers), draftId, request.version);
  }

  @Get('history')
  history(@Headers() headers: RuntimeHeaders, @Query('limit') limit?: string): Promise<StudioHistoryEntry[]> {
    return this.designerEngine.listVersions(this.contextEngine.resolve(headers), limit ? Number(limit) : undefined);
  }
}
