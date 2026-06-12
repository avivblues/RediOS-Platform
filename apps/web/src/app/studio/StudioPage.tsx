import { BuilderShell } from '../../studio/builder/BuilderShell';
import { CreateApplicationPage } from '../../studio/create/CreateApplicationPage';
import { MetadataDesignerPage } from '../../studio/metadata/MetadataDesignerPage';

export function StudioPage() {
  const route = studioRoute(window.location.pathname);

  if (route === 'metadata') {
    return <MetadataDesignerPage />;
  }

  if (route === 'create') {
    return <CreateApplicationPage />;
  }

  if (route === 'android') {
    return <BuilderShell target="android" />;
  }

  return <BuilderShell target="web" />;
}

function studioRoute(pathname: string): 'builder' | 'metadata' | 'android' | 'create' {
  if (pathname.startsWith('/studio/metadata')) {
    return 'metadata';
  }

  if (pathname.startsWith('/studio/create')) {
    return 'create';
  }

  if (pathname.startsWith('/studio/builder/android')) {
    return 'android';
  }

  return 'builder';
}
