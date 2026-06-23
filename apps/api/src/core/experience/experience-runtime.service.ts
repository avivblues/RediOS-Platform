import { Injectable } from '@nestjs/common';
import type {
  ExperienceContext,
  ExperienceNotification,
  ExperiencePlatform,
  ResolvedPersona,
  RuntimeContext,
  WorkspaceDefinition,
} from '@redios/shared';
import { ActionQueueService } from './action-center/action.queue';
import { InboxEngine } from './inbox/inbox.engine';
import { NotificationCenterService } from './notification/notification-center.service';
import { PersonaResolver } from './persona/persona.resolver';
import { WorkspaceEngine } from './workspace/workspace.engine';
import { WorkspaceMetadataService } from './workspace/workspace-metadata.service';

@Injectable()
export class ExperienceRuntimeService {
  constructor(
    private readonly personaResolver: PersonaResolver,
    private readonly workspaceEngine: WorkspaceEngine,
    private readonly inboxEngine: InboxEngine,
    private readonly actionQueue: ActionQueueService,
    private readonly notificationCenter: NotificationCenterService,
    private readonly workspaceMetadata: WorkspaceMetadataService,
  ) {}

  resolvePersona(context: RuntimeContext): Promise<ResolvedPersona> {
    return this.personaResolver.resolve(context);
  }

  listNotifications(context: RuntimeContext, since?: string): Promise<ExperienceNotification[]> {
    return this.notificationCenter.list(context, 20, since);
  }

  markNotificationRead(context: RuntimeContext, notificationId: string) {
    return this.notificationCenter.markRead(context, notificationId);
  }

  listWorkspaces(context: RuntimeContext) {
    return this.workspaceMetadata.list(context);
  }

  saveWorkspace(context: RuntimeContext, definition: WorkspaceDefinition) {
    return this.workspaceMetadata.save(context, definition);
  }

  completeInboxItem(context: RuntimeContext, inboxItemId: string) {
    return this.inboxEngine.completeHumanTask(context, inboxItemId);
  }

  async resolveContext(context: RuntimeContext, platform: ExperiencePlatform = 'WEB'): Promise<ExperienceContext> {
    const persona = await this.personaResolver.resolve(context);
    const [workspace, inbox, actions, notifications] = await Promise.all([
      this.workspaceEngine.resolve(context, persona, platform),
      this.inboxEngine.list(context, persona),
      this.actionQueue.list(context, persona),
      this.notificationCenter.list(context),
    ]);

    return { persona, workspace, inbox, actions, notifications };
  }
}
