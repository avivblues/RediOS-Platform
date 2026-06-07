import { RuntimeContextProvider } from './core/context/runtime-context';
import { StudioPage } from './app/studio/StudioPage';
import { RuntimePage } from './pages/RuntimePage';

export function App() {
  const isStudio = window.location.pathname.startsWith('/studio');

  return (
    <RuntimeContextProvider>
      {isStudio ? <StudioPage /> : <RuntimePage />}
    </RuntimeContextProvider>
  );
}
