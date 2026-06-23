import type { ResolvedPersona } from './persona-definition';
import type { ActionQueueItem, ExperienceNotification, InboxItem, ResolvedWorkspace } from './workspace-definition';

export type { PlatformPersona, ResolvedPersona } from './persona-definition';

export interface ExperienceContext {
  persona: ResolvedPersona;
  workspace: ResolvedWorkspace;
  inbox: InboxItem[];
  actions: ActionQueueItem[];
  notifications: ExperienceNotification[];
}
