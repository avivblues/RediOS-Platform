import { RediosVisualBuilder } from '../../studio/builder/RediosVisualBuilder';
import { VisualFirstMetadataDesigner } from '../../studio/metadata/VisualFirstMetadataDesigner';

export function StudioPage() {
  const route = studioRoute(window.location.pathname);

  if (route === 'metadata') {
    return <VisualFirstMetadataDesigner />;
  }

  if (route === 'android') {
    return <RediosVisualBuilder target="android" />;
  }

  return <RediosVisualBuilder target="web" />;
}

function studioRoute(pathname: string): 'builder' | 'metadata' | 'android' {
  if (pathname.startsWith('/studio/metadata')) {
    return 'metadata';
  }

  if (pathname.startsWith('/studio/builder/android')) {
    return 'android';
  }

  return 'builder';
}
