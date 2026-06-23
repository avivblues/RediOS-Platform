import { Injectable } from '@nestjs/common';
import type { ActionQueueItem, ResolvedPersona, RuntimeContext } from '@redios/shared';
import { MetadataResolver } from '../../metadata/metadata-resolver.service';
import { workspaceForPersona } from '../workspace/workspace.definitions';

@Injectable()
export class ActionQueueService {
  constructor(private readonly metadataResolver: MetadataResolver) {}

  async list(context: RuntimeContext, persona: ResolvedPersona): Promise<ActionQueueItem[]> {
    const workspace = workspaceForPersona(persona.persona);
    const actions: ActionQueueItem[] = [];
    let priority = 1;

    for (const panel of workspace.panels) {
      if (panel.type !== 'LINK' || !panel.target?.startsWith('/runtime/')) {
        continue;
      }

      const entityCode = panel.target.replace('/runtime/', '').split('/')[0] ?? '';
      if (!entityCode || entityCode.includes('_PAGE')) {
        continue;
      }

      try {
        const entity = await this.metadataResolver.resolveEntity(context, entityCode);
        for (const actionCode of entity.definition.actionCodes ?? []) {
          actions.push({
            id: `${entityCode}_${actionCode}`,
            label: `${actionCode} ${entityCode}`,
            entityCode,
            actionCode,
            href: `/runtime/${entityCode}`,
            priority: priority++,
          });
        }
      } catch {
        // Skip entities that are not in the active application scope.
      }
    }

    return actions.slice(0, 12);
  }
}
