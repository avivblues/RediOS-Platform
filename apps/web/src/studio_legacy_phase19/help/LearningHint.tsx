import type { PropsWithChildren } from 'react';

export function LearningHint({ title, children }: PropsWithChildren<{ title: string }>) {
  return (
    <aside className="studio-learning-hint">
      <strong>{title}</strong>
      <p>{children}</p>
    </aside>
  );
}
