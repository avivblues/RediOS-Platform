import { AuthProvider } from './auth/context/AuthProvider';
import { LoginPage } from './auth/pages/LoginPage';
import { ProfilePage } from './auth/pages/ProfilePage';
import { RegisterPage } from './auth/pages/RegisterPage';
import { RuntimeContextProvider } from './core/context/runtime-context';
import { StudioPage } from './app/studio/StudioPage';
import { RuntimePage } from './pages/RuntimePage';
import { RuntimeAppShell } from './runtime/RuntimeAppShell';

export function App() {
  const isStudio = window.location.pathname.startsWith('/studio');
  const authRoute = authRouteFromLocation(window.location.pathname);
  const generatedApplicationCode = generatedApplicationCodeFromLocation(window.location.pathname);

  return (
    <RuntimeContextProvider>
      <AuthProvider>
        {isStudio
          ? <StudioPage />
          : authRoute === 'login'
            ? <LoginPage />
            : authRoute === 'register'
              ? <RegisterPage />
              : authRoute === 'profile'
                ? <ProfilePage />
                : generatedApplicationCode
                  ? <RuntimeAppShell applicationCode={generatedApplicationCode} />
                  : <RuntimePage />}
      </AuthProvider>
    </RuntimeContextProvider>
  );
}

function generatedApplicationCodeFromLocation(pathname: string): string | undefined {
  const [, route, applicationCode] = pathname.split('/');
  return route === 'apps' && applicationCode ? applicationCode : undefined;
}

function authRouteFromLocation(pathname: string): 'login' | 'profile' | 'register' | undefined {
  if (pathname === '/login') {
    return 'login';
  }

  if (pathname === '/register') {
    return 'register';
  }

  if (pathname === '/profile') {
    return 'profile';
  }

  return undefined;
}
