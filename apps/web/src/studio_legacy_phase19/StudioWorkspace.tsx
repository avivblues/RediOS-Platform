import type { PropsWithChildren } from 'react';

export function StudioWorkspace({ children }: PropsWithChildren) {
  return <div className="studio-workspace-stack">{children}</div>;
}
