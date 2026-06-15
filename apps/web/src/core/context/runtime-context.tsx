import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import type { RuntimeContext } from '../renderer/runtime-types';

const identitySession = readIdentitySession();

const defaultContext: RuntimeContext = {
  tenantId: readSetting('tenantId', import.meta.env.VITE_REDIOS_TENANT_ID, 'demo'),
  domainCode: readSetting('domainCode', import.meta.env.VITE_REDIOS_DOMAIN_CODE, 'DEFAULT'),
  applicationCode: readSetting('applicationCode', import.meta.env.VITE_REDIOS_APPLICATION_CODE, 'ASSET_MAINTENANCE'),
  userId: identitySession?.userId ?? readSetting('userId', import.meta.env.VITE_REDIOS_USER_ID, 'admin'),
  permissions: identitySession?.permissions ?? (readSetting(
    'permissions',
    import.meta.env.VITE_REDIOS_PERMISSIONS,
    'FORM.DESIGN,FORM.PUBLISH,WORK_ORDER.READ,WORK_ORDER.START,WORK_ORDER.UPDATE',
  ) ?? '')
    .split(',')
    .map((permission) => permission.trim())
    .filter(Boolean),
  roles: identitySession?.roles ?? (readSetting('roles', import.meta.env.VITE_REDIOS_ROLES, 'TECHNICIAN') ?? '')
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

function readSetting(key: string, fallback?: string, defaultValue = ''): string {
  const params = new URLSearchParams(window.location.search);
  return params.get(key) ?? window.localStorage.getItem(`redios.${key}`) ?? fallback ?? defaultValue;
}

function readIdentitySession(): { permissions: string[]; roles: string[]; userId: string } | undefined {
  try {
    const rawValue = window.localStorage.getItem('redios:identity:session');
    return rawValue ? JSON.parse(rawValue) as { permissions: string[]; roles: string[]; userId: string } : undefined;
  } catch {
    return undefined;
  }
}
