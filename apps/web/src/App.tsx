import { RuntimeContextProvider } from './core/context/runtime-context';
import { StudioPage } from './app/studio/StudioPage';
import { RuntimePage } from './pages/RuntimePage';
import { RuntimeAppShell } from './runtime/RuntimeAppShell';

export function App() {
  const isStudio = window.location.pathname.startsWith('/studio');
  const generatedApplicationCode = generatedApplicationCodeFromLocation(window.location.pathname);

  return (
    <RuntimeContextProvider>
      {isStudio ? <StudioPage /> : generatedApplicationCode ? <RuntimeAppShell applicationCode={generatedApplicationCode} /> : <RuntimePage />}
    </RuntimeContextProvider>
  );
}

function generatedApplicationCodeFromLocation(pathname: string): string | undefined {
  const [, route, applicationCode] = pathname.split('/');
  return route === 'apps' && applicationCode ? applicationCode : undefined;
}
