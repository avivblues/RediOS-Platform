import { AuthProvider } from './auth/context/AuthProvider';
import { LoginPage } from './auth/pages/LoginPage';
import { ProfilePage } from './auth/pages/ProfilePage';
import { RegisterPage } from './auth/pages/RegisterPage';
import { RuntimeContextProvider } from './core/context/runtime-context';
import { StudioPage } from './app/studio/StudioPage';
import { LandingPage } from './pages/LandingPage';
import { PortalPage } from './pages/PortalPage';
import { ExperienceWorkspacePage } from './pages/ExperienceWorkspacePage';
import { NotificationCenterPage } from './pages/NotificationCenterPage';
import { RuntimePage } from './pages/RuntimePage';
import { RuntimeAppShell } from './runtime/RuntimeAppShell';

export function App() {
  const pathname = window.location.pathname;
  const isStudio = pathname.startsWith('/studio');
  const authRoute = authRouteFromLocation(pathname);
  const generatedApplicationCode = generatedApplicationCodeFromLocation(pathname);

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
                : authRoute === 'portal'
                  ? <PortalPage />
                  : pathname === '/workspace'
                    ? <ExperienceWorkspacePage />
                    : pathname === '/notifications'
                      ? <NotificationCenterPage />
                      : isLandingRoute(pathname)
                    ? <LandingPage />
                    : generatedApplicationCode
                      ? <RuntimeAppShell applicationCode={generatedApplicationCode} />
                      : pathname.startsWith('/runtime/')
                        ? <RuntimePage />
                        : <LandingPage />}
      </AuthProvider>
    </RuntimeContextProvider>
  );
}

function isLandingRoute(pathname: string) {
  return pathname === '/' || pathname === '';
}

function generatedApplicationCodeFromLocation(pathname: string): string | undefined {
  const [, route, applicationCode] = pathname.split('/');
  return route === 'apps' && applicationCode ? applicationCode : undefined;
}

function authRouteFromLocation(pathname: string): 'login' | 'profile' | 'register' | 'portal' | undefined {
  if (pathname === '/login') {
    return 'login';
  }

  if (pathname === '/register') {
    return 'register';
  }

  if (pathname === '/profile') {
    return 'profile';
  }

  if (pathname === '/portal') {
    return 'portal';
  }

  return undefined;
}
