import { ForbiddenException, Injectable } from '@nestjs/common';
import type { ActionDefinition, MetadataDefinition, RuntimeContext } from '@redios/shared';
import { MetadataResolver } from '../metadata/metadata-resolver.service';

export interface RuntimeActionPlan {
  actionCode: string;
  actionType: string;
  label: string;
  allowed: true;
  next: 'WORKFLOW_ENGINE';
  behavior: ActionDefinition['behavior'];
  payload: unknown;
}

@Injectable()
export class ActionEngine {
  constructor(private readonly metadataResolver: MetadataResolver) {}

  async resolve(
    context: RuntimeContext,
    entityCode: string,
    actionCode: string,
  ): Promise<MetadataDefinition<ActionDefinition>> {
    const action = await this.metadataResolver.resolveAction(context, entityCode, actionCode);

    if (!action.definition.enabled) {
      throw new ForbiddenException(`Action is disabled: ${actionCode}`);
    }

    return action;
  }

  prepare(action: MetadataDefinition<ActionDefinition>, payload: unknown): RuntimeActionPlan {
    return {
      actionCode: action.definition.code,
      actionType: action.definition.type,
      label: action.definition.label,
      allowed: true,
      next: 'WORKFLOW_ENGINE',
      behavior: action.definition.behavior,
      payload,
    };
  }
}
