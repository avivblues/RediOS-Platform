import type { PropsWithChildren, ReactNode } from 'react';

export function LearningPanel({
  title,
  summary,
  children,
}: PropsWithChildren<{
  title: string;
  summary: string;
}>) {
  return (
    <aside className="studio-learning-panel">
      <div>
        <span className="studio-kicker">Guide</span>
        <h3>{title}</h3>
        <p>{summary}</p>
      </div>
      {children}
    </aside>
  );
}

export function LearningPanelActions({ children }: { children: ReactNode }) {
  return <div className="studio-action-row">{children}</div>;
}
