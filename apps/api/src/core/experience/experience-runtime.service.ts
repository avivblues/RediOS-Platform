import { Injectable } from '@nestjs/common';
import type {
  ExperienceContext,
  ExperienceNotification,
  ExperiencePlatform,
  ResolvedPersona,
  RuntimeContext,
  WorkspaceDefinition,
} from '@redios/shared';
import { ApprovalEngine } from '../tunasflow/approval/approval.engine';
import { HumanTaskEngine } from './human-task/human-task.engine';
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
    private readonly humanTaskEngine: HumanTaskEngine,
    private readonly approvalEngine: ApprovalEngine,
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

  async completeInboxItem(context: RuntimeContext, inboxItemId: string) {
    const taskId = inboxItemId.startsWith('human_') ? inboxItemId.slice('human_'.length) : inboxItemId;
    const taskBeforeComplete = await this.humanTaskEngine.findOne(context, taskId);
    const completed = await this.inboxEngine.completeHumanTask(context, inboxItemId);

    if (completed && taskBeforeComplete) {
      await this.approvalEngine.onTaskCompleted(context, taskBeforeComplete);
    }

    return completed;
  }

  async delegateInboxItem(
    context: RuntimeContext,
    inboxItemId: string,
    input: { assigneeUserId?: string; assigneeRoles?: string[] },
  ) {
    const taskId = inboxItemId.startsWith('human_') ? inboxItemId.slice('human_'.length) : inboxItemId;
    return this.humanTaskEngine.delegate(context, taskId, input);
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
