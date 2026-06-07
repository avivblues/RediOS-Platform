import { ForbiddenException, Injectable } from '@nestjs/common';
import type { RuntimeContext } from '@redios/shared';
import { MetadataResolver } from '../metadata/metadata-resolver.service';

export interface WorkflowTransitionResult {
  from: string;
  to: string;
  actionCode: string;
  transitioned: boolean;
}

@Injectable()
export class WorkflowEngine {
  constructor(private readonly metadataResolver: MetadataResolver) {}

  async resolveInitialStatus(context: RuntimeContext, entityCode: string): Promise<string | undefined> {
    const workflow = await this.metadataResolver.resolveWorkflow(context, entityCode);
    const initialState = workflow?.definition.states.find((state) => state.initial || state.type === 'INITIAL');
    return initialState?.code;
  }

  async transition(
    context: RuntimeContext,
    entityCode: string,
    currentStatus: string | undefined,
    actionCode: string,
  ): Promise<WorkflowTransitionResult> {
    const workflow = await this.metadataResolver.resolveWorkflow(context, entityCode);

    if (!workflow) {
      return {
        from: currentStatus ?? '',
        to: currentStatus ?? '',
        actionCode,
        transitioned: false,
      };
    }

    if (!currentStatus) {
      throw new ForbiddenException(`Invalid workflow transition: missing current status for ${actionCode}`);
    }

    const transition = workflow.definition.transitions.find(
      (candidate) => candidate.from === currentStatus && candidate.actionCode === actionCode,
    );

    if (!transition) {
      throw new ForbiddenException(`Invalid workflow transition: ${currentStatus} -> ${actionCode}`);
    }

    return {
      from: transition.from,
      to: transition.to,
      actionCode,
      transitioned: true,
    };
  }
}
