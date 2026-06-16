import type { ReactNode } from 'react';

export type RediosIconName = 'app' | 'bell' | 'chevron' | 'database' | 'menu' | 'search' | 'shield' | 'user';

export interface RediosNavItem {
  id: string;
  label: string;
  active?: boolean;
  meta?: string;
  onSelect: () => void;
}

export interface RediosNavGroup {
  id: string;
  label: string;
  active?: boolean;
  items?: RediosNavItem[];
  onSelect?: () => void;
}

export interface RediosDataColumn {
  key: string;
  label: string;
}

export function RediosDashboardShell({
  autoHideSidebar = false,
  children,
  sidebar,
  topbar,
}: {
  autoHideSidebar?: boolean;
  children: ReactNode;
  sidebar: ReactNode;
  topbar: ReactNode;
}) {
  return (
    <div className="redios-dashboard-shell" data-sidebar-auto-hide={autoHideSidebar ? 'true' : 'false'}>
      {sidebar}
      <div className="redios-dashboard-workspace">
        {topbar}
        <main className="redios-dashboard-main">{children}</main>
      </div>
    </div>
  );
}

export function RediosDashboardSidebar({
  brandSubtitle,
  brandTitle,
  groups,
}: {
  brandSubtitle: string;
  brandTitle: string;
  groups: RediosNavGroup[];
}) {
  return (
    <aside className="redios-dashboard-sidebar" aria-label="Application menu">
      <div className="redios-dashboard-brand">
        <span className="redios-dashboard-brand-icon">
          <RediosIcon name="app" />
        </span>
        <div>
          <span>{brandSubtitle}</span>
          <strong>{brandTitle}</strong>
        </div>
      </div>

      <nav className="redios-dashboard-nav">
        {groups.map((group) => (
          <div key={group.id} className="redios-dashboard-nav-group">
            <button
              className={group.active ? 'redios-dashboard-nav-active' : ''}
              type="button"
              onClick={group.onSelect}
            >
              <span className="redios-dashboard-nav-icon">
                <RediosIcon name={group.items?.length ? 'menu' : 'database'} />
              </span>
              <span>{group.label}</span>
              {group.items?.length ? <RediosIcon name="chevron" /> : null}
            </button>

            {group.items?.length ? (
              <div className="redios-dashboard-nav-children">
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    className={item.active ? 'redios-dashboard-nav-active' : ''}
                    type="button"
                    onClick={item.onSelect}
                  >
                    <span>{item.label}</span>
                    {item.meta ? <small>{item.meta}</small> : null}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </nav>
    </aside>
  );
}

export function RediosDashboardTopbar({
  context,
  onLogout,
  onProfile,
  status,
  title,
}: {
  context: string;
  onLogout?: () => void;
  onProfile?: () => void;
  status: string;
  title: string;
}) {
  return (
    <header className="redios-dashboard-topbar">
      <div className="redios-dashboard-search" aria-label="Application context">
        <RediosIcon name="search" />
        <span>{context}</span>
      </div>
      <div className="redios-dashboard-topbar-meta">
        <span className="redios-dashboard-status">{status}</span>
        <button type="button" aria-label="Notifications">
          <RediosIcon name="bell" />
        </button>
        <button type="button" aria-label="User profile" onClick={onProfile}>
          <RediosIcon name="user" />
          <span>{title}</span>
        </button>
        {onLogout ? <button type="button" onClick={onLogout}>Logout</button> : null}
      </div>
    </header>
  );
}

export function RediosPageHero({
  breadcrumbs,
  children,
  subtitle,
  title,
}: {
  breadcrumbs: string[];
  children?: ReactNode;
  subtitle: string;
  title: string;
}) {
  return (
    <section className="redios-page-hero">
      <div>
        <RediosBreadcrumbs items={breadcrumbs} />
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {children ? <div className="redios-page-hero-actions">{children}</div> : null}
    </section>
  );
}

export function RediosBreadcrumbs({ items }: { items: string[] }) {
  return (
    <nav className="redios-breadcrumbs" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <span key={`${item}-${index}`}>
          {item}
          {index < items.length - 1 ? <RediosIcon name="chevron" /> : null}
        </span>
      ))}
    </nav>
  );
}

export function RediosCard({
  children,
  description,
  eyebrow,
  title,
}: {
  children: ReactNode;
  description?: string;
  eyebrow?: string;
  title?: string;
}) {
  return (
    <section className="redios-dashboard-card">
      {title || description || eyebrow ? (
        <div className="redios-dashboard-card-header">
          {eyebrow ? <span className="redios-dashboard-eyebrow">{eyebrow}</span> : null}
          {title ? <h3>{title}</h3> : null}
          {description ? <p>{description}</p> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function RediosStatusPills({ items }: { items: string[] }) {
  return (
    <div className="redios-status-pills">
      {items.map((item) => (
        <span key={item}>{item}</span>
      ))}
    </div>
  );
}

export function RediosDataTable({
  columns,
  emptyText,
  rows,
}: {
  columns: RediosDataColumn[];
  emptyText: string;
  rows: Array<Record<string, unknown>>;
}) {
  if (rows.length === 0) {
    return <p className="redios-dashboard-empty">{emptyText}</p>;
  }

  return (
    <div className="redios-data-table-wrap">
      <table className="redios-data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={String(row.id ?? rowIndex)}>
              {columns.map((column) => (
                <td key={column.key}>{formatTableValue(row[column.key])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function RediosModal({
  cancelLabel,
  children,
  confirmLabel,
  onCancel,
  onConfirm,
  title,
}: {
  cancelLabel: string;
  children: ReactNode;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
}) {
  return (
    <div className="redios-modal-backdrop" role="presentation">
      <section className="redios-modal" role="dialog" aria-modal="true" aria-labelledby="redios-modal-title">
        <div>
          <span className="redios-dashboard-eyebrow">Confirm Action</span>
          <h3 id="redios-modal-title">{title}</h3>
          <div className="redios-modal-body">{children}</div>
        </div>
        <div className="redios-modal-actions">
          <button type="button" onClick={onCancel}>{cancelLabel}</button>
          <button className="redios-modal-primary" type="button" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </section>
    </div>
  );
}

export function RediosIcon({ name }: { name: RediosIconName }) {
  if (name === 'bell') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M12 22a2.4 2.4 0 0 0 2.2-1.45H9.8A2.4 2.4 0 0 0 12 22Zm7-5.4-1.6-1.9V10a5.4 5.4 0 0 0-4.1-5.25V4a1.3 1.3 0 1 0-2.6 0v.75A5.4 5.4 0 0 0 6.6 10v4.7L5 16.6V18h14v-1.4Z" />
      </svg>
    );
  }

  if (name === 'chevron') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="m9.2 6.4 5.6 5.6-5.6 5.6 1.6 1.6 7.2-7.2-7.2-7.2-1.6 1.6Z" />
      </svg>
    );
  }

  if (name === 'database') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M12 3C7.6 3 4 4.45 4 6.25v11.5C4 19.55 7.6 21 12 21s8-1.45 8-3.25V6.25C20 4.45 16.4 3 12 3Zm0 2c3.5 0 5.7.9 6 1.25-.3.35-2.5 1.25-6 1.25s-5.7-.9-6-1.25C6.3 5.9 8.5 5 12 5Zm6 8.7c-.7.55-2.8 1.2-6 1.2s-5.3-.65-6-1.2v-2.4c1.45.75 3.6 1.15 6 1.15s4.55-.4 6-1.15v2.4Zm-6 5.3c-3.2 0-5.3-.65-6-1.2v-2.35c1.45.75 3.6 1.15 6 1.15s4.55-.4 6-1.15v2.35c-.7.55-2.8 1.2-6 1.2Z" />
      </svg>
    );
  }

  if (name === 'search') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M10.8 4a6.8 6.8 0 0 1 5.35 11l3.4 3.4-1.45 1.45-3.4-3.4A6.8 6.8 0 1 1 10.8 4Zm0 2a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 0 0 0-9.6Z" />
      </svg>
    );
  }

  if (name === 'shield') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M12 2 5 5v5.6c0 4.45 2.95 8.6 7 9.85 4.05-1.25 7-5.4 7-9.85V5l-7-3Zm0 2.2 5 2.15v4.25c0 3.35-2.05 6.55-5 7.7-2.95-1.15-5-4.35-5-7.7V6.35l5-2.15Z" />
      </svg>
    );
  }

  if (name === 'user') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 2c-4.2 0-7.5 2.15-7.5 4.9V21h15v-2.1c0-2.75-3.3-4.9-7.5-4.9Z" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z" />
    </svg>
  );
}

function formatTableValue(value: unknown) {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
}
