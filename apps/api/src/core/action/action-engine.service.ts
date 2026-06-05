import { Injectable } from '@nestjs/common';
import type { ActionDefinition, MetadataDefinition, RuntimeContext } from '@redios/shared';
import { MetadataResolver } from '../metadata/metadata-resolver.service';

export interface RuntimeActionPlan {
  actionCode: string;
  workflowTransitionCode?: string;
  processCode?: string;
  payload: unknown;
}

@Injectable()
export class ActionEngine {
  constructor(private readonly metadataResolver: MetadataResolver) {}

  resolve(context: RuntimeContext, actionCode: string): Promise<MetadataDefinition<ActionDefinition>> {
    return this.metadataResolver.resolveAction(context, actionCode);
  }

  prepare(action: MetadataDefinition<ActionDefinition>, payload: unknown): RuntimeActionPlan {
    return {
      actionCode: action.definition.code,
      workflowTransitionCode: action.definition.workflowTransitionCode,
      processCode: action.definition.processCode,
      payload,
    };
  }
}
