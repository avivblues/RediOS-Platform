import type { ExperienceContext, ExperienceNotification, ExperiencePlatform, MetadataDefinition, WorkspaceDefinition } from '@redios/shared';
import { buildAuthHeaders, redirectToLoginIfUnauthorized } from '../session';

const API_BASE_URL = import.meta.env.VITE_REDIOS_API_URL ?? '/api';

function detectPlatform(): ExperiencePlatform {
  if (typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches) {
    return 'MOBILE';
  }

  return 'WEB';
}

export async function getExperienceContext(platform = detectPlatform()): Promise<ExperienceContext> {
  const response = await fetch(`${API_BASE_URL}/experience/me?platform=${platform}`, {
    headers: {
      ...buildAuthHeaders(),
    },
  });

  if (!response.ok) {
    if (redirectToLoginIfUnauthorized(response)) {
      throw new Error('Session expired. Please sign in again.');
    }

    let message = 'Failed to load experience context.';
    try {
      const body = await response.json() as { message?: string | string[] };
      message = Array.isArray(body.message) ? body.message.join(', ') : (body.message ?? message);
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  return response.json() as Promise<ExperienceContext>;
}

export async function getNotifications(): Promise<ExperienceNotification[]> {
  const response = await fetch(`${API_BASE_URL}/experience/notifications`, {
    headers: {
      ...buildAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error('Failed to load notifications.');
  }

  return response.json() as Promise<ExperienceNotification[]>;
}

export async function getNotificationsSince(since: string): Promise<ExperienceNotification[]> {
  const response = await fetch(`${API_BASE_URL}/experience/notifications?since=${encodeURIComponent(since)}`, {
    headers: {
      ...buildAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error('Failed to load notifications.');
  }

  return response.json() as Promise<ExperienceNotification[]>;
}

export async function markNotificationRead(notificationId: string): Promise<ExperienceNotification> {
  const response = await fetch(`${API_BASE_URL}/experience/notifications/${notificationId}/read`, {
    method: 'PATCH',
    headers: {
      ...buildAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error('Failed to mark notification as read.');
  }

  return response.json() as Promise<ExperienceNotification>;
}

export async function listWorkspaces(): Promise<MetadataDefinition<WorkspaceDefinition>[]> {
  const response = await fetch(`${API_BASE_URL}/experience/workspaces`, {
    headers: {
      ...buildAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error('Failed to load workspace metadata.');
  }

  return response.json() as Promise<MetadataDefinition<WorkspaceDefinition>[]>;
}

export async function saveWorkspace(definition: WorkspaceDefinition): Promise<MetadataDefinition<WorkspaceDefinition>> {
  const response = await fetch(`${API_BASE_URL}/experience/workspaces/${encodeURIComponent(definition.code)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...buildAuthHeaders(),
    },
    body: JSON.stringify(definition),
  });

  if (!response.ok) {
    throw new Error('Failed to publish workspace metadata.');
  }

  return response.json() as Promise<MetadataDefinition<WorkspaceDefinition>>;
}

export async function completeInboxItem(inboxItemId: string): Promise<{ completed: boolean }> {
  const response = await fetch(`${API_BASE_URL}/experience/inbox/${encodeURIComponent(inboxItemId)}/complete`, {
    method: 'PATCH',
    headers: {
      ...buildAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error('Failed to complete inbox item.');
  }

  return response.json() as Promise<{ completed: boolean }>;
}
