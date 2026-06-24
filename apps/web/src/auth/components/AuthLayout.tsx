import type { ReactNode } from 'react';

export function AuthLayout({
  children,
  title,
  tagline,
}: {
  children: ReactNode;
  title: string;
  tagline?: string;
}) {
  return (
    <main className="redios-auth-page">
      <section className="redios-auth-hero">
        <div className="redios-auth-brand">
          <span>R</span>
          <strong>RediOS</strong>
        </div>
        <div>
          <h1>{title}</h1>
          {tagline ? <p className="redios-auth-tagline">{tagline}</p> : null}
        </div>
      </section>
      <section className="redios-auth-panel">
        {children}
      </section>
    </main>
  );
}
