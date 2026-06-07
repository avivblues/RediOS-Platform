import type { PropsWithChildren } from 'react';
import { RuntimeContextProvider } from '../core/context/runtime-context';

export default function AppLayout({ children }: PropsWithChildren) {
  return <RuntimeContextProvider>{children}</RuntimeContextProvider>;
}
