import { Body, Controller, Headers, Param, Post } from '@nestjs/common';
import type { DesignerOperation } from '@redios/shared';
import { ContextEngine, type RuntimeHeaders } from '../core/context/context.engine';
import {
  DesignerEngine,
  type CreateDesignerDraftRequest,
  type DesignerPreviewResult,
  type DesignerPublishResult,
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
}
