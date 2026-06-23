import { Injectable } from '@nestjs/common';
import type { InboxItem, ResolvedPersona, RuntimeContext } from '@redios/shared';
import { StorageEngine } from '../../storage/storage.engine';
import { HumanTaskEngine } from '../human-task/human-task.engine';

@Injectable()
export class InboxEngine {
  constructor(
    private readonly storageEngine: StorageEngine,
    private readonly humanTaskEngine: HumanTaskEngine,
  ) {}

  async list(context: RuntimeContext, persona: ResolvedPersona): Promise<InboxItem[]> {
    const items: InboxItem[] = [];

    if (persona.persona !== 'PROGRAMMER') {
      const humanTasks = await this.humanTaskEngine.list(context, persona);
      items.push(...this.humanTaskEngine.toInboxItems(humanTasks));

      const workOrders = await this.storageEngine.findMany(context, 'WORK_ORDER', {});

      for (const document of workOrders) {
        const status = String(document.status ?? 'OPEN');
        if (status === 'DONE' || status === 'CANCELLED') {
          continue;
        }

        const title = String(document.data?.title ?? document.id ?? 'Work Order');
        items.push({
          id: `inbox_${document.id}`,
          title,
          entityCode: 'WORK_ORDER',
          documentId: document.id,
          actionCode: status === 'OPEN' ? 'START' : 'COMPLETE',
          status: status === 'OPEN' ? 'WAITING' : 'IN_PROGRESS',
          priority: String(document.data?.priority ?? 'NORMAL').toUpperCase() === 'HIGH' ? 'HIGH' : 'NORMAL',
          source: 'WORKFLOW',
        });
      }
    }

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
