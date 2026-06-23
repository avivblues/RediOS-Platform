import type { PlatformPersona } from './persona-definition';

export type WorkspacePanelType = 'INBOX' | 'ACTIONS' | 'NAVIGATION' | 'PAGE' | 'METRIC' | 'LINK' | 'NOTIFICATIONS';

export interface WorkspacePanelDefinition {
  code: string;
  label: string;
  description?: string;
  type: WorkspacePanelType;
  target?: string;
  order: number;
  icon?: string;
  requiredCapabilities?: string[];
}

export interface WorkspaceDefinition {
  code: string;
  persona: PlatformPersona;
  title: string;
  subtitle?: string;
  platform?: 'WEB' | 'MOBILE' | 'ALL';
  panels: WorkspacePanelDefinition[];
  enabled?: boolean;
}

export interface ResolvedWorkspace {
  code: string;
  persona: PlatformPersona;
  title: string;
  subtitle?: string;
  panels: WorkspacePanelDefinition[];
}

export interface InboxItem {
  id: string;
  title: string;
  entityCode: string;
  documentId?: string;
  actionCode?: string;
  status: 'WAITING' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'NORMAL' | 'HIGH';
  source: 'WORKFLOW' | 'PROCESS' | 'SYSTEM';
  dueAt?: string;
}

export interface ActionQueueItem {
  id: string;
  label: string;
  entityCode: string;
  actionCode: string;
  href: string;
  priority: number;
}

export interface ExperienceNotification {
  id: string;
  title: string;
  message: string;
  eventCode?: string;
  targetRole?: string;
  read: boolean;
  createdAt: string;
}
