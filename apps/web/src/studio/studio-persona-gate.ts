import type { PlatformPersona } from '@redios/shared';

export type StudioRoute = 'builder' | 'metadata' | 'query' | 'api' | 'android' | 'create';

export interface StudioAccess {
  allowed: boolean;
  routes: StudioRoute[];
  message?: string;
}

const FULL_ROUTES: StudioRoute[] = ['builder', 'metadata', 'query', 'api', 'create', 'android'];
const MANAGER_ROUTES: StudioRoute[] = ['builder', 'metadata'];

export function resolveStudioAccess(persona: PlatformPersona): StudioAccess {
  switch (persona) {
    case 'SYSTEM_ADMIN':
    case 'PROGRAMMER':
      return { allowed: true, routes: FULL_ROUTES };
    case 'MANAGER':
      return {
        allowed: true,
        routes: MANAGER_ROUTES,
        message: 'Manager mode: form and layout customization only.',
      };
    default:
      return {
        allowed: false,
        routes: [],
        message: 'Studio access requires Programmer or Manager persona.',
      };
  }
}

export function isStudioRouteAllowed(persona: PlatformPersona, route: StudioRoute): boolean {
  const access = resolveStudioAccess(persona);
  return access.allowed && access.routes.includes(route);
}
