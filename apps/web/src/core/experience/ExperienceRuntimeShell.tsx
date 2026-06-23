import type { PropsWithChildren } from 'react';

export function ExperienceRuntimeShell({ children }: PropsWithChildren) {
  return (
    <div className="redios-experience-runtime-shell">
      <header className="redios-experience-runtime-bar">
        <a className="redios-experience-runtime-back" href="/workspace">← Back to workspace</a>
        <nav className="redios-experience-runtime-nav">
          <a href="/notifications">Notifications</a>
          <a href="/portal">Switch workspace</a>
        </nav>
      </header>
      <div className="redios-experience-runtime-body">
        {children}
      </div>
    </div>
  );
}
