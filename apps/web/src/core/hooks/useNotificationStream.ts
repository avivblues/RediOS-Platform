import { useEffect } from 'react';
import type { ExperienceNotification } from '@redios/shared';
import { readAuthSession } from '../../auth/session';

const API_BASE_URL = import.meta.env.VITE_REDIOS_API_URL ?? '/api';

export function useNotificationStream(
  enabled: boolean,
  onNotification: (notification: ExperienceNotification) => void,
) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const session = readAuthSession();
    if (!session?.accessToken) {
      return;
    }

    const url = `${API_BASE_URL}/experience/notifications/stream?token=${encodeURIComponent(session.accessToken)}`;
    const source = new EventSource(url);

    source.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as {
          type?: string;
          notification?: ExperienceNotification;
        };

        if (payload.type === 'notification' && payload.notification) {
          onNotification(payload.notification);
        }
      } catch {
        // Ignore malformed stream payloads.
      }
    };

    return () => {
      source.close();
    };
  }, [enabled, onNotification]);
}
