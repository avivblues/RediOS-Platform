import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import type { MobileRuntimeContext } from '../api/mobile-runtime-types';

const defaultContext: MobileRuntimeContext = {
  tenantId: readSetting('EXPO_PUBLIC_REDIOS_TENANT_ID', 'demo'),
  domainCode: readSetting('EXPO_PUBLIC_REDIOS_DOMAIN_CODE', 'DEFAULT'),
  applicationCode: readSetting('EXPO_PUBLIC_REDIOS_APPLICATION_CODE', 'ASSET_MAINTENANCE'),
  userId: readSetting('EXPO_PUBLIC_REDIOS_USER_ID', 'mobile-runtime'),
  permissions: readList('EXPO_PUBLIC_REDIOS_PERMISSIONS'),
  roles: readList('EXPO_PUBLIC_REDIOS_ROLES'),
  groups: readList('EXPO_PUBLIC_REDIOS_GROUPS'),
  attributes: {},
};

export interface RuntimeContextValue {
  context: MobileRuntimeContext;
  updateContext: (next: Partial<MobileRuntimeContext>) => void;
}

const RuntimeContextState = createContext<RuntimeContextValue | undefined>(undefined);

export function RuntimeContextProvider({ children }: PropsWithChildren) {
  const [context, setContext] = useState<MobileRuntimeContext>(defaultContext);
  const value = useMemo<RuntimeContextValue>(
    () => ({
      context,
      updateContext: (next) => setContext((current) => ({ ...current, ...next })),
    }),
    [context],
  );

  return <RuntimeContextState.Provider value={value}>{children}</RuntimeContextState.Provider>;
}

export function useRuntimeContext(): RuntimeContextValue {
  const value = useContext(RuntimeContextState);

  if (!value) {
    throw new Error('RuntimeContextProvider is required.');
  }

  return value;
}

function readSetting(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

function readList(key: string): string[] {
  return (process.env[key] ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}
