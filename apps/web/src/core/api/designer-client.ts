import type { DesignerOperation, DesignerTargetType, MetadataDefinition, MetadataDraft } from '@redios/shared';
import type { ApiClient } from './api-client';

export interface CreateDraftRequest {
  targetType: DesignerTargetType;
  targetCode: string;
  entityCode?: string;
}

export interface DesignerPreviewResult {
  valid: boolean;
  validation: {
    valid: boolean;
    errors: number;
    warnings: number;
    issues: Array<{
      code: string;
      severity: string;
      message: string;
      path: string;
    }>;
  };
  simulation: unknown;
  affected: string[];
  dependencies: {
    safe: boolean;
    impacts: Array<{
      type: string;
      code: string;
      impact: 'BREAKING' | 'WARNING' | 'INFO';
      reason: string;
    }>;
  };
  draft: MetadataDraft;
}

export interface DesignerPublishResult {
  draft: MetadataDraft;
  published: {
    code: string;
    type: string;
    version: number;
  };
  traceId?: string;
}

export interface GeneratedMetadataPublishResult {
  published: MetadataDefinition[];
  validation: Array<{
    valid: boolean;
    errors: number;
    warnings: number;
  }>;
  dependencies: Array<{
    type: string;
    code: string;
    impact: 'BREAKING' | 'WARNING' | 'INFO';
    reason: string;
  }>;
  runtimePackages: Array<{
    applicationCode: string;
    status: string;
  }>;
}

export interface StudioHistoryEntry {
  id: string;
  version: number;
  targetType: string;
  targetCode: string;
  entityCode?: string;
  summary: string;
  createdBy: string;
  createdAt?: string;
}

export class DesignerClient {
  constructor(private readonly api: ApiClient) {}

  createDraft(request: CreateDraftRequest): Promise<MetadataDraft> {
    return this.api.post('/designer/drafts', request);
  }

  applyOperation(draftId: string, operation: DesignerOperation): Promise<MetadataDraft> {
    return this.api.post(`/designer/${draftId}/operations`, operation);
  }

  preview(draftId: string): Promise<DesignerPreviewResult> {
    return this.api.post(`/designer/${draftId}/preview`);
  }

  publish(draftId: string): Promise<DesignerPublishResult> {
    return this.api.post(`/designer/${draftId}/publish`);
  }

  publishGenerated(metadata: MetadataDefinition[]): Promise<GeneratedMetadataPublishResult> {
    return this.api.post('/designer/generated/publish', { metadata });
  }

  rollback(draftId: string, version: number): Promise<DesignerPublishResult> {
    return this.api.post(`/designer/${draftId}/rollback`, { version });
  }

  history(limit = 12): Promise<StudioHistoryEntry[]> {
    return this.api.get(`/designer/history?limit=${limit}`);
  }
}
