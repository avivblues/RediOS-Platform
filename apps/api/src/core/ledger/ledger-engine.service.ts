import { Injectable } from '@nestjs/common';
import type { LedgerImpactType, RuntimeContext, RuntimeDocument } from '@redios/shared';
import { MetadataResolver } from '../metadata/metadata-resolver.service';

export interface LedgerImpactPlan {
  code: string;
  type: LedgerImpactType;
  target: string;
  mapping: Record<string, string>;
  preview: Record<string, unknown>;
  status: 'READY';
}

export interface LedgerExecutionState {
  workflowState?: string;
  eventCodes?: string[];
}

export interface LedgerExecutionResult {
  status: 'IMPACT_READY';
  impacts: LedgerImpactPlan[];
  next: 'COMPLETED';
}

@Injectable()
export class LedgerEngine {
  constructor(private readonly metadataResolver: MetadataResolver) {}

  async execute(
    context: RuntimeContext,
    document: RuntimeDocument,
    actionCode: string,
    state: LedgerExecutionState = {},
  ): Promise<LedgerExecutionResult> {
    const ledger = await this.metadataResolver.resolveLedger(
      context,
      document.entityCode,
      actionCode,
      state.workflowState,
      state.eventCodes,
    );

    if (!ledger) {
      return {
        status: 'IMPACT_READY',
        impacts: [],
        next: 'COMPLETED',
      };
    }

    return {
      status: 'IMPACT_READY',
      impacts: ledger.definition.impacts
        .filter((impact) => impact.enabled)
        .map((impact) => ({
          code: impact.code,
          type: impact.type,
          target: impact.target.entityCode,
          mapping: impact.mapping,
          preview: this.previewMapping(document, impact.mapping),
          status: 'READY',
        })),
      next: 'COMPLETED',
    };
  }

  private previewMapping(document: RuntimeDocument, mapping: Record<string, string>): Record<string, unknown> {
    return Object.entries(mapping).reduce<Record<string, unknown>>((preview, [targetField, sourcePath]) => {
      preview[targetField] = this.resolvePath(document, sourcePath);
      return preview;
    }, {});
  }

  private resolvePath(document: RuntimeDocument, sourcePath: string): unknown {
    const source = document as unknown as Record<string, unknown>;
    return sourcePath.split('.').reduce<unknown>((value, pathPart) => {
      if (value && typeof value === 'object' && pathPart in value) {
        return (value as Record<string, unknown>)[pathPart];
      }

      return undefined;
    }, source);
  }
}
