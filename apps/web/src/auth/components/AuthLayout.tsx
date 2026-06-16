import type { ReactNode } from 'react';

export function AuthLayout({
  children,
  eyebrow,
  subtitle,
  title,
}: {
  children: ReactNode;
  eyebrow: string;
  subtitle: string;
  title: string;
}) {
  return (
    <main className="redios-auth-page">
      <section className="redios-auth-hero">
        <div className="redios-auth-brand">
          <span>R</span>
          <strong>RediOS</strong>
        </div>
        <div>
          <span className="redios-auth-eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <ul>
          <li>Metadata-first application platform</li>
          <li>Runtime identity foundation ready</li>
          <li>Enterprise SaaS experience</li>
        </ul>
      </section>
      <section className="redios-auth-panel">
        {children}
      </section>
    </main>
  );
}
