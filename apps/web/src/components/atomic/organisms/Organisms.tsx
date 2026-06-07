import type { PropsWithChildren } from 'react';

export function Panel({ title, children }: PropsWithChildren<{ title: string }>) {
  return (
    <section className="studio-panel">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

export function BuilderCanvas({ children }: PropsWithChildren) {
  return <div className="studio-builder-canvas">{children}</div>;
}

export function Sidebar({ children }: PropsWithChildren) {
  return <aside className="studio-sidebar">{children}</aside>;
}
