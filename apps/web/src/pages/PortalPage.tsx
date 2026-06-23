import { useEffect, useMemo, useState } from 'react';
import { AuthLayout } from '../auth/components/AuthLayout';
import { useAuth } from '../auth/context/AuthProvider';
import { allPersonaRoutes, resolvePersona, type PersonaRoute } from '../auth/role-routing';
import { getExperienceContext } from '../auth/services/experience.api';
import { useRuntimeContext } from '../core/context/runtime-context';
import { hasAnyPersonaCapability } from '../core/security/persona-capability';

const ROUTE_CAPABILITIES: Record<PersonaRoute['persona'], string[]> = {
  programmer: ['metadata.*', 'builder.*'],
  manager: ['runtime.access', 'dashboard.read'],
  staff: ['runtime.access'],
};

export function PortalPage() {
  const auth = useAuth();
  const { updateContext } = useRuntimeContext();
  const session = auth.session;
  const [capabilities, setCapabilities] = useState<string[]>([]);
  const recommended = useMemo(
    () => (session ? resolvePersona(session.roles) : 'staff'),
    [session],
  );

  useEffect(() => {
    if (!session) {
      return;
    }

    void getExperienceContext()
      .then((context) => setCapabilities(context.persona.capabilities))
      .catch(() => setCapabilities([]));
  }, [session]);

  if (!session) {
    window.location.href = '/login';
    return null;
  }

  const visibleRoutes = allPersonaRoutes().filter((route) =>
    hasAnyPersonaCapability(capabilities, ROUTE_CAPABILITIES[route.persona]),
  );

  function openWorkspace(route: PersonaRoute) {
    updateContext({
      applicationCode: route.applicationCode,
      permissions: session!.permissions,
      roles: session!.roles,
      userId: session!.userId,
      accessToken: session!.accessToken,
    });
    window.location.href = route.href;
  }

  return (
    <AuthLayout
      eyebrow="Workspace Portal"
      subtitle="Choose how you want to work today. RediOS recommends a workspace based on your platform role."
      title="Welcome back. Where should we take you?"
    >
      <section className="redios-portal">
        <div className="redios-portal-heading">
          <span>Signed in as {session.displayName}</span>
          <h2>Select your workspace</h2>
          <p>Roles: {session.roles.join(', ') || 'Staff'}</p>
        </div>

        <div className="redios-portal-grid">
          {visibleRoutes.map((route) => (
            <button
              key={route.persona}
              className={`redios-portal-card${route.persona === recommended ? ' is-recommended' : ''}`}
              type="button"
              onClick={() => openWorkspace(route)}
            >
              {route.persona === recommended ? <small>Recommended</small> : null}
              <strong>{route.label}</strong>
              <p>{route.description}</p>
              <span>Open workspace</span>
            </button>
          ))}
        </div>

        <div className="redios-portal-actions">
          <button type="button" onClick={() => {
            auth.logout();
            window.location.href = '/';
          }}
          >
            Logout
          </button>
        </div>
      </section>
    </AuthLayout>
  );
}
