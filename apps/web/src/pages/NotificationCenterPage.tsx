import { useCallback, useEffect, useRef, useState } from 'react';
import type { ExperienceNotification } from '@redios/shared';
import { useAuth } from '../auth/context/AuthProvider';
import { getNotifications, markNotificationRead } from '../auth/services/experience.api';
import { useNotificationStream } from '../core/hooks/useNotificationStream';

export function NotificationCenterPage() {
  const auth = useAuth();
  const [items, setItems] = useState<ExperienceNotification[]>([]);
  const [error, setError] = useState<string | undefined>();
  const mergeRef = useRef<(notification: ExperienceNotification) => void>(() => undefined);

  mergeRef.current = (notification) => {
    setItems((current) => mergeNotifications(current, [notification]));
  };

  const onStreamNotification = useCallback((notification: ExperienceNotification) => {
    mergeRef.current(notification);
  }, []);

  useNotificationStream(Boolean(auth.session), onStreamNotification);

  useEffect(() => {
    if (!auth.session) {
      window.location.href = '/login';
      return;
    }

    void getNotifications()
      .then(setItems)
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : String(loadError)));
  }, [auth.session]);

  async function readNotification(id: string) {
    const updated = await markNotificationRead(id);
    setItems((current) => current.map((item) => (item.id === id ? updated : item)));
  }

  return (
    <main className="redios-workspace-page">
      <header className="redios-workspace-header">
        <div>
          <span className="redios-workspace-eyebrow">Notification Center</span>
          <h1>Alerts and system events</h1>
          <p>Event-driven notifications delivered to your persona and role. Live updates via SSE.</p>
        </div>
        <div className="redios-workspace-header-actions">
          <button type="button" onClick={() => { window.location.href = '/workspace'; }}>Back to workspace</button>
        </div>
      </header>

      {error ? <div className="redios-workspace-error">{error}</div> : null}

      <section className="redios-notification-list">
        {items.length === 0 ? (
          <p className="redios-workspace-empty">No notifications yet.</p>
        ) : (
          items.map((item) => (
            <article key={item.id} className={`redios-notification-item${item.read ? ' is-read' : ''}`}>
              <div>
                <strong>{item.title}</strong>
                <p>{item.message}</p>
                <small>{item.targetRole ? `Role: ${item.targetRole}` : 'Personal'} · {new Date(item.createdAt).toLocaleString()}</small>
              </div>
              {!item.read ? (
                <button type="button" onClick={() => { void readNotification(item.id); }}>Mark read</button>
              ) : null}
            </article>
          ))
        )}
      </section>
    </main>
  );
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
