import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../auth/context/AuthProvider';
import { PersonaCapabilityGate } from '../core/security/PersonaCapabilityGate';
import { useExperiencePolling } from '../core/hooks/useExperiencePolling';
import { useNotificationStream } from '../core/hooks/useNotificationStream';
import { completeInboxItem } from '../auth/services/experience.api';
import type { ExperienceNotification } from '@redios/shared';

export function ExperienceWorkspacePage() {
  const auth = useAuth();
  const { context, error, setContext } = useExperiencePolling(Boolean(auth.session));

  const mergeNotification = useCallback((notification: ExperienceNotification) => {
    setContext((current) => {
      if (!current) {
        return current;
      }

      const map = new Map(current.notifications.map((item) => [item.id, item]));
      map.set(notification.id, notification);
      return {
        ...current,
        notifications: [...map.values()].sort(
          (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
        ),
      };
    });
  }, [setContext]);

  useNotificationStream(Boolean(auth.session), mergeNotification);

  if (!auth.session) {
    window.location.href = '/login';
    return null;
  }

  if (error) {
    return <main className="redios-workspace-page"><div className="redios-workspace-error">{error}</div></main>;
  }

  if (!context) {
    return <main className="redios-workspace-page"><div className="redios-workspace-loading">Loading workspace...</div></main>;
  }

  const { persona, workspace, inbox, actions, notifications } = context;
  const unreadCount = notifications.filter((item) => !item.read).length;

  async function completeTask(inboxItemId: string) {
    await completeInboxItem(inboxItemId);
    setContext((current) => (
      current
        ? { ...current, inbox: current.inbox.filter((item) => item.id !== inboxItemId) }
        : current
    ));
  }

  return (
    <main className="redios-workspace-page">
      <header className="redios-workspace-header">
        <div>
          <span className="redios-workspace-eyebrow">{persona.label}</span>
          <h1>{workspace.title}</h1>
          <p>{workspace.subtitle ?? persona.description}</p>
        </div>
        <div className="redios-workspace-header-actions">
          <PersonaCapabilityGate capabilities={persona.capabilities} required="notification.read">
            <button type="button" onClick={() => { window.location.href = '/notifications'; }}>
              Notifications{unreadCount > 0 ? ` (${unreadCount})` : ''}
            </button>
          </PersonaCapabilityGate>
          <button type="button" onClick={() => { window.location.href = '/portal'; }}>Switch workspace</button>
          <button type="button" onClick={() => {
            auth.logout();
            window.location.href = '/login';
          }}
          >
            Logout
          </button>
        </div>
      </header>

      <section className="redios-workspace-panels">
        {workspace.panels.map((panel) => (
          <PersonaCapabilityGate
            key={panel.code}
            capabilities={persona.capabilities}
            required={panel.requiredCapabilities}
          >
            <article className="redios-workspace-panel">
              <div className="redios-workspace-panel-head">
                <strong>{panel.label}</strong>
                <small>{panel.type}</small>
              </div>

              {panel.type === 'INBOX' ? (
                <InboxList items={inbox} onComplete={(id) => { void completeTask(id); }} />
              ) : null}

              {panel.type === 'ACTIONS' ? (
                <ActionList items={actions} />
              ) : null}

              {panel.type === 'LINK' && panel.target ? (
                <a className="redios-workspace-link" href={panel.target}>Open {panel.label}</a>
              ) : null}

              {panel.type === 'NOTIFICATIONS' ? (
                <NotificationPanel items={notifications} target={panel.target} />
              ) : null}

              {panel.type === 'METRIC' ? (
                <div className="redios-workspace-metrics">
                  <MetricCard label="Waiting" value={String(inbox.filter((item) => item.status === 'WAITING').length)} />
                  <MetricCard label="In Progress" value={String(inbox.filter((item) => item.status === 'IN_PROGRESS').length)} />
                  <MetricCard label="Actions" value={String(actions.length)} />
                  <MetricCard label="Unread" value={String(unreadCount)} />
                </div>
              ) : null}
            </article>
          </PersonaCapabilityGate>
        ))}
      </section>
    </main>
  );
}

function InboxList({
  items,
  onComplete,
}: {
  items: import('@redios/shared').ExperienceContext['inbox'];
  onComplete: (id: string) => void;
}) {
  if (items.length === 0) {
    return <p className="redios-workspace-empty">No tasks waiting for you.</p>;
  }

  return (
    <ul className="redios-workspace-list">
      {items.slice(0, 6).map((item) => (
        <li key={item.id}>
          <div>
            <strong>{item.title}</strong>
            <small>{item.entityCode} · {item.status} · {item.source}</small>
          </div>
          <div className="redios-workspace-list-actions">
            {item.id.startsWith('human_') ? (
              <button type="button" onClick={() => onComplete(item.id)}>Complete</button>
            ) : null}
            {item.documentId ? (
              <a href={`/runtime/${item.entityCode}`}>Open</a>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}

function ActionList({ items }: { items: import('@redios/shared').ExperienceContext['actions'] }) {
  if (items.length === 0) {
    return <p className="redios-workspace-empty">No pending actions.</p>;
  }

  return (
    <ul className="redios-workspace-list">
      {items.slice(0, 6).map((item) => (
        <li key={item.id}>
          <div>
            <strong>{item.label}</strong>
            <small>{item.entityCode}</small>
          </div>
          <a href={item.href}>Run</a>
        </li>
      ))}
    </ul>
  );
}

function NotificationPanel({
  items,
  target,
}: {
  items: import('@redios/shared').ExperienceContext['notifications'];
  target?: string;
}) {
  const unread = items.filter((item) => !item.read);

  return (
    <div className="redios-workspace-notifications">
      {unread.length === 0 ? (
        <p className="redios-workspace-empty">No unread notifications.</p>
      ) : (
        <ul className="redios-workspace-list">
          {unread.slice(0, 4).map((item) => (
            <li key={item.id}>
              <div>
                <strong>{item.title}</strong>
                <small>{item.message}</small>
              </div>
            </li>
          ))}
        </ul>
      )}
      <a className="redios-workspace-link" href={target ?? '/notifications'}>Open notification center</a>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="redios-workspace-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
