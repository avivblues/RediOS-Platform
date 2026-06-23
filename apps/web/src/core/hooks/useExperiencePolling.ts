import { useEffect, useRef, useState } from 'react';
import type { ExperienceContext, ExperienceNotification } from '@redios/shared';
import { getExperienceContext, getNotificationsSince } from '../../auth/services/experience.api';

const POLL_INTERVAL_MS = 30_000;

export function useExperiencePolling(enabled: boolean) {
  const [context, setContext] = useState<ExperienceContext | undefined>();
  const [error, setError] = useState<string | undefined>();
  const lastPollRef = useRef<string>(new Date().toISOString());

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let mounted = true;

    void getExperienceContext()
      .then((result) => {
        if (mounted) {
          setContext(result);
          lastPollRef.current = new Date().toISOString();
        }
      })
      .catch((loadError) => {
        if (mounted) {
          setError(loadError instanceof Error ? loadError.message : String(loadError));
        }
      });

    const timer = window.setInterval(() => {
      const since = lastPollRef.current;

      void Promise.all([
        getNotificationsSince(since),
        getExperienceContext(),
      ])
        .then(([notifications, nextContext]) => {
          if (!mounted) {
            return;
          }

          lastPollRef.current = new Date().toISOString();

          if (notifications.length > 0) {
            const merged = mergeNotifications(nextContext.notifications, notifications);
            setContext({ ...nextContext, notifications: merged });
          } else {
            setContext(nextContext);
          }
        })
        .catch(() => {
          // Keep polling on transient failures.
        });
    }, POLL_INTERVAL_MS);

    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, [enabled]);

  return { context, error, setContext };
}

function mergeNotifications(existing: ExperienceNotification[], incoming: ExperienceNotification[]) {
  const map = new Map(existing.map((item) => [item.id, item]));
  for (const item of incoming) {
    map.set(item.id, item);
  }

  return [...map.values()].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
}
