import { useAuth } from '../auth/context/AuthProvider';
import { postLoginDestination, resolvePersona, personaRoute } from '../auth/role-routing';

export function LandingPage() {
  const auth = useAuth();
  const session = auth.session;

  return (
    <main className="redios-landing">
      <div className="redios-landing-dark">
        <header className="redios-landing-topbar">
          <div className="redios-auth-brand">
            <span>R</span>
            <strong>RediOS</strong>
          </div>
          <nav>
            {session
              ? (
                <button
                  className="redios-auth-primary"
                  type="button"
                  onClick={() => {
                    window.location.href = postLoginDestination(session.roles);
                  }}
                >
                  Continue
                </button>
              )
              : (
                <>
                  <a className="redios-landing-link" href="/login">Login</a>
                  <a className="redios-auth-primary redios-landing-cta" href="/login">Get Started</a>
                </>
              )}
          </nav>
        </header>

        <section className="redios-landing-hero">
          <span className="redios-landing-eyebrow">Enterprise Operating Platform</span>
          <h1>Build, run, and govern metadata-driven applications from one kernel.</h1>
          <p>
            RediOS connects identity, runtime, workflow, and capability registry so your team can
            ship industrial applications without hardcoded ERP modules.
          </p>
          <div className="redios-landing-actions">
            <a className="redios-auth-primary" href="/login">Sign in to workspace</a>
            <a className="redios-landing-secondary" href="/register">Create account</a>
          </div>
        </section>
      </div>

      <section className="redios-landing-grid">
        <PersonaCard
          title="Programmer"
          body="Design entities, forms, workflows, and publish runtime packages from Studio."
        />
        <PersonaCard
          title="Manager"
          body="Supervise work orders, assets, and operational status from the runtime dashboard."
        />
        <PersonaCard
          title="Staff"
          body="Execute field tasks with mobile-first runtime screens and guided actions."
        />
      </section>

      {session ? (
        <section className="redios-landing-session">
          <strong>Signed in as {session.displayName}</strong>
          <span>
            Recommended workspace:
            {' '}
            {personaRoute(resolvePersona(session.roles)).label}
          </span>
          <button
            className="redios-auth-primary"
            type="button"
            onClick={() => {
              window.location.href = postLoginDestination(session.roles);
            }}
          >
            Open my workspace
          </button>
        </section>
      ) : null}

      <footer className="redios-landing-footer">
        <span>RediOS Platform · Metadata-first kernel runtime</span>
      </footer>
    </main>
  );
}

function PersonaCard({ title, body }: { title: string; body: string }) {
  return (
    <article className="redios-landing-card">
      <h2>{title}</h2>
      <p>{body}</p>
    </article>
  );
}
