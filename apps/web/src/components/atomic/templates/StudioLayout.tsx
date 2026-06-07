import type { PropsWithChildren, ReactNode } from 'react';

export function StudioLayout({
  header,
  sidebar,
  children,
}: PropsWithChildren<{
  header: ReactNode;
  sidebar: ReactNode;
}>) {
  return (
    <div className="studio-shell">
      <header className="studio-header">{header}</header>
      <div className="studio-body">
        {sidebar}
        <main className="studio-workspace">{children}</main>
      </div>
    </div>
  );
}
