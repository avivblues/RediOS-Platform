import type { PropsWithChildren } from 'react';

export function GuidedHint({ title, children }: PropsWithChildren<{ title: string }>) {
  return (
    <div className="studio-guided-hint">
      <strong>{title}</strong>
      <p>{children}</p>
    </div>
  );
}
