import { RuntimeContextProvider } from './core/context/runtime-context';
import { StudioPage } from './app/studio/StudioPage';
import { RuntimePage } from './pages/RuntimePage';
import { RuntimeAppShell } from './runtime/RuntimeAppShell';

export function App() {
  const isStudio = window.location.pathname.startsWith('/studio');
  const identityScreenCode = identityScreenCodeFromLocation(window.location.pathname);
  const generatedApplicationCode = generatedApplicationCodeFromLocation(window.location.pathname);

  return (
    <RuntimeContextProvider>
      {isStudio
        ? <StudioPage />
        : identityScreenCode
          ? <RuntimeAppShell applicationCode="redios-admin" initialScreenCode={identityScreenCode} />
          : generatedApplicationCode
            ? <RuntimeAppShell applicationCode={generatedApplicationCode} />
            : <RuntimePage />}
    </RuntimeContextProvider>
  );
}

function generatedApplicationCodeFromLocation(pathname: string): string | undefined {
  const [, route, applicationCode] = pathname.split('/');
  return route === 'apps' && applicationCode ? applicationCode : undefined;
}

function identityScreenCodeFromLocation(pathname: string): string | undefined {
  if (pathname === '/login') {
    return 'LOGIN_FORM';
  }

  if (pathname === '/register') {
    return 'REGISTER_FORM';
  }

  return undefined;
}
