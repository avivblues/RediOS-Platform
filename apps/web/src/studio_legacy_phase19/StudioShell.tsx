import type { PropsWithChildren, ReactNode } from 'react';
import { StudioLayout } from '../components/atomic/templates/StudioLayout';

export function StudioShell({
  header,
  sidebar,
  children,
}: PropsWithChildren<{
  header: ReactNode;
  sidebar: ReactNode;
}>) {
  return (
    <StudioLayout header={header} sidebar={sidebar}>
      {children}
    </StudioLayout>
  );
}
