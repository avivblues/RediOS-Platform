import type { ExperiencePlatform, PlatformPersona, WorkspaceDefinition } from '@redios/shared';

export const WORKSPACE_DEFINITIONS: WorkspaceDefinition[] = [
  {
    code: 'SYSTEM_CONTROL_CENTER',
    persona: 'SYSTEM_ADMIN',
    title: 'System Control Center',
    subtitle: 'Platform governance, identity, and builder access.',
    platform: 'ALL',
    enabled: true,
    panels: [
      { code: 'USERS', label: 'User Management', type: 'LINK', target: '/apps/redios-admin', order: 1 },
      { code: 'STUDIO', label: 'RediOS Studio', type: 'LINK', target: '/studio', order: 2, requiredCapabilities: ['builder.*', 'metadata.*'] },
      { code: 'INBOX', label: 'Universal Inbox', type: 'INBOX', order: 3 },
      { code: 'ACTIONS', label: 'Action Center', type: 'ACTIONS', order: 4 },
      { code: 'NOTIFICATIONS', label: 'Notifications', type: 'NOTIFICATIONS', target: '/notifications', order: 5 },
      { code: 'CAPABILITIES', label: 'Capability Registry', type: 'LINK', target: '/runtime/WORK_ORDER', order: 6, requiredCapabilities: ['platform.*'] },
    ],
  },
  {
    code: 'REDI_STUDIO_WORKSPACE',
    persona: 'PROGRAMMER',
    title: 'RediOS Studio',
    subtitle: 'Metadata, UI, workflow, and integration design.',
    platform: 'ALL',
    enabled: true,
    panels: [
      { code: 'STUDIO', label: 'Studio Builder', type: 'LINK', target: '/studio', order: 1 },
      { code: 'METADATA', label: 'Metadata Designer', type: 'LINK', target: '/studio/metadata', order: 2 },
      { code: 'RUNTIME', label: 'Runtime Preview', type: 'LINK', target: '/runtime/WORK_ORDER', order: 3 },
      { code: 'ACTIONS', label: 'Action Center', type: 'ACTIONS', order: 4 },
    ],
  },
  {
    code: 'MANAGEMENT_WORKSPACE',
    persona: 'MANAGER',
    title: 'Management Workspace',
    subtitle: 'Exception-driven operations and approvals.',
    platform: 'ALL',
    enabled: true,
    panels: [
      { code: 'INBOX', label: 'Universal Inbox', type: 'INBOX', order: 1 },
      { code: 'NOTIFICATIONS', label: 'Notifications', type: 'NOTIFICATIONS', target: '/notifications', order: 2 },
      { code: 'ACTIONS', label: 'Action Center', type: 'ACTIONS', order: 3 },
      { code: 'WORK_ORDERS', label: 'Work Orders', type: 'LINK', target: '/runtime/WORK_ORDER', order: 4 },
      { code: 'ASSETS', label: 'Assets', type: 'LINK', target: '/runtime/ASSET', order: 5 },
      { code: 'DASHBOARD', label: 'Operations Dashboard', type: 'METRIC', order: 6 },
    ],
  },
  {
    code: 'MY_WORKSPACE',
    persona: 'STAFF',
    title: 'My Workspace',
    subtitle: 'Tasks, approvals, and field execution.',
    platform: 'WEB',
    enabled: true,
    panels: [
      { code: 'TASKS', label: 'My Tasks', type: 'INBOX', order: 1 },
      { code: 'NOTIFICATIONS', label: 'Notifications', type: 'NOTIFICATIONS', target: '/notifications', order: 2 },
      { code: 'ACTIONS', label: 'My Actions', type: 'ACTIONS', order: 3 },
      { code: 'FIELD', label: 'Field Work Orders', type: 'LINK', target: '/runtime/WORK_ORDER_MOBILE_PAGE', order: 4 },
      { code: 'DASHBOARD', label: 'Today Summary', type: 'METRIC', order: 5 },
    ],
  },
  {
    code: 'MY_WORKSPACE_MOBILE',
    persona: 'STAFF',
    title: 'Field Workspace',
    subtitle: 'Mobile-first task execution.',
    platform: 'MOBILE',
    enabled: true,
    panels: [
      { code: 'TASKS', label: 'My Tasks', type: 'INBOX', order: 1 },
      { code: 'FIELD', label: 'Start Work Order', type: 'LINK', target: '/runtime/WORK_ORDER_MOBILE_PAGE', order: 2 },
      { code: 'NOTIFICATIONS', label: 'Alerts', type: 'NOTIFICATIONS', target: '/notifications', order: 3 },
    ],
  },
];

export function workspaceForPersona(persona: PlatformPersona, platform: ExperiencePlatform = 'WEB') {
  if (platform === 'MOBILE') {
    const mobile = WORKSPACE_DEFINITIONS.find((workspace) => workspace.persona === persona && workspace.platform === 'MOBILE');
    if (mobile) {
      return mobile;
    }
  }

  return WORKSPACE_DEFINITIONS.find(
    (workspace) => workspace.persona === persona && workspace.platform !== 'MOBILE',
  ) ?? WORKSPACE_DEFINITIONS.find((workspace) => workspace.code === 'MY_WORKSPACE')!;
}

export function workspaceCodeForPersona(persona: PlatformPersona, platform: ExperiencePlatform = 'WEB') {
  return workspaceForPersona(persona, platform).code;
}
