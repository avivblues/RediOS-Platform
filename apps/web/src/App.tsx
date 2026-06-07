import { RuntimeContextProvider } from './core/context/runtime-context';
import { RuntimePage } from './pages/RuntimePage';

export function App() {
  return (
    <RuntimeContextProvider>
      <RuntimePage />
    </RuntimeContextProvider>
  );
}
