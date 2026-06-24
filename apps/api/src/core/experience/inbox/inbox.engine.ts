import { Injectable } from '@nestjs/common';
import type { InboxItem, ResolvedPersona, RuntimeContext } from '@redios/shared';
import { HumanTaskEngine } from '../human-task/human-task.engine';

/**
 * Universal inbox — items come from TunasFlow human tasks only.
 * Workflow/document shortcuts are not hardcoded per entity; use metadata process HUMAN_TASK steps.
 */
@Injectable()
export class InboxEngine {
  constructor(private readonly humanTaskEngine: HumanTaskEngine) {}

  async list(context: RuntimeContext, persona: ResolvedPersona): Promise<InboxItem[]> {
    if (persona.persona === 'PROGRAMMER') {
      return [];
    }

    const humanTasks = await this.humanTaskEngine.list(context, persona);
    const items = this.humanTaskEngine.toInboxItems(humanTasks);

    return items.sort((left, right) => {
      const priorityWeight = { HIGH: 0, NORMAL: 1, LOW: 2 };
      return priorityWeight[left.priority] - priorityWeight[right.priority];
    });
  }

  async completeHumanTask(context: RuntimeContext, inboxItemId: string): Promise<boolean> {
    const taskId = inboxItemId.startsWith('human_') ? inboxItemId.slice('human_'.length) : inboxItemId;
    const result = await this.humanTaskEngine.complete(context, taskId);
    return Boolean(result);
  }
}
