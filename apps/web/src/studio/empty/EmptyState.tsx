import type { ReactNode } from 'react';
import { Button } from '../../components/atomic/atoms/Atoms';

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
  return (
    <div className="studio-empty-state">
      <strong>{title}</strong>
      <p>{description}</p>
      <div className="studio-action-row">
        {primaryAction ?? <Button variant="secondary">Create</Button>}
        {secondaryAction ?? <Button variant="secondary">Learn More</Button>}
      </div>
    </div>
  );
}
