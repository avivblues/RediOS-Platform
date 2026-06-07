import { RuntimeContextProvider } from './src/core/context/runtime-context';
import { RuntimeScreen } from './src/app/RuntimeScreen';

const defaultEntityCode = process.env.EXPO_PUBLIC_REDIOS_ENTITY_CODE ?? 'WORK_ORDER';

export default function App() {
  return (
    <RuntimeContextProvider>
      <RuntimeScreen entityCode={defaultEntityCode} />
    </RuntimeContextProvider>
  );
}
