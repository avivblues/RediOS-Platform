import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import type { RuntimeContext } from '../renderer/runtime-types';

const defaultContext: RuntimeContext = {
  tenantId: readSetting('tenantId', import.meta.env.VITE_REDIOS_TENANT_ID),
  domainCode: readSetting('domainCode', import.meta.env.VITE_REDIOS_DOMAIN_CODE),
  applicationCode: readSetting('applicationCode', import.meta.env.VITE_REDIOS_APPLICATION_CODE),
  userId: readSetting('userId', import.meta.env.VITE_REDIOS_USER_ID),
  permissions: (readSetting('permissions', import.meta.env.VITE_REDIOS_PERMISSIONS) ?? '')
    .split(',')
    .map((permission) => permission.trim())
    .filter(Boolean),
  roles: (readSetting('roles', import.meta.env.VITE_REDIOS_ROLES) ?? '')
    .split(',')
    .map((role) => role.trim())
    .filter(Boolean),
  groups: [],
  attributes: {},
};

export interface RuntimeContextValue {
  context: RuntimeContext;
  updateContext: (next: Partial<RuntimeContext>) => void;
}

const RuntimeContextState = createContext<RuntimeContextValue | undefined>(undefined);

export function RuntimeContextProvider({ children }: PropsWithChildren) {
  const [context, setContext] = useState<RuntimeContext>(defaultContext);
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

function readSetting(key: string, fallback?: string): string {
  const params = new URLSearchParams(window.location.search);
  return params.get(key) ?? window.localStorage.getItem(`redios.${key}`) ?? fallback ?? '';
}
