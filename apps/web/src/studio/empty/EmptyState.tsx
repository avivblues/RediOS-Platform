import type { ReactNode } from 'react';

export function EmptyState({
  title,
  description,
  primaryAction,
  secondaryAction,
}: {
  title: string;
  description: string;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
}) {
  const hasActions = Boolean(primaryAction || secondaryAction);

  return (
    <div className="studio-empty-state">
      <strong>{title}</strong>
      <p>{description}</p>
      {hasActions ? <div className="studio-action-row">{primaryAction}{secondaryAction}</div> : null}
    </div>
  );
}
