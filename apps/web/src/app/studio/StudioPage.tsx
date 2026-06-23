import { useEffect, useState } from 'react';
import type { PlatformPersona } from '@redios/shared';
import { getExperienceContext } from '../../auth/services/experience.api';
import { ApiBuilderPage } from '../../studio/api/ApiBuilderPage';
import { BuilderShell } from '../../studio/builder/BuilderShell';
import { CreateApplicationPage } from '../../studio/create/CreateApplicationPage';
import { MetadataDesignerPage } from '../../studio/metadata/MetadataDesignerPage';
import { QueryBuilderPage } from '../../studio/query/QueryBuilderPage';
import { isStudioRouteAllowed, resolveStudioAccess, type StudioRoute } from '../../studio/studio-persona-gate';

export function StudioPage() {
  const route = studioRoute(window.location.pathname);
  const [persona, setPersona] = useState<PlatformPersona | undefined>();
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    void getExperienceContext()
      .then((context) => setPersona(context.persona.persona))
      .catch((loadError: unknown) => setError(loadError instanceof Error ? loadError.message : String(loadError)));
  }, []);

  if (error) {
    return <main className="redios-workspace-page"><div className="redios-workspace-error">{error}</div></main>;
  }

  if (!persona) {
    return <main className="redios-workspace-page"><div className="redios-workspace-loading">Loading studio access...</div></main>;
  }

  const access = resolveStudioAccess(persona);

  if (!access.allowed) {
    return (
      <main className="redios-workspace-page">
        <div className="redios-workspace-error">
          {access.message}
          {' '}
          <a href="/workspace">Return to workspace</a>
        </div>
      </main>
    );
  }

  if (!isStudioRouteAllowed(persona, route)) {
    return (
      <main className="redios-workspace-page">
        <div className="redios-workspace-error">
          {access.message ?? 'This studio mode is not available for your persona.'}
          {' '}
          <a href="/studio">Open allowed studio mode</a>
        </div>
      </main>
    );
  }

  if (route === 'metadata') {
    return <MetadataDesignerPage />;
  }

  if (route === 'query') {
    return <QueryBuilderPage />;
  }

  if (route === 'api') {
    return <ApiBuilderPage />;
  }

  if (route === 'create') {
    return <CreateApplicationPage />;
  }

  if (route === 'android') {
    return <BuilderShell target="android" />;
  }

  return <BuilderShell target="web" />;
}

function studioRoute(pathname: string): StudioRoute {
  if (pathname.startsWith('/studio/metadata')) {
    return 'metadata';
  }

  if (pathname.startsWith('/studio/query')) {
    return 'query';
  }

  if (pathname.startsWith('/studio/api')) {
    return 'api';
  }

  if (pathname.startsWith('/studio/create')) {
    return 'create';
  }

  if (pathname.startsWith('/studio/builder/android')) {
    return 'android';
  }

  return 'builder';
}
