export type PersonaKind = 'programmer' | 'manager' | 'staff';

export interface PersonaRoute {
  persona: PersonaKind;
  label: string;
  description: string;
  href: string;
  applicationCode: string;
}

const PROGRAMMER_ROLES = new Set(['SYSTEM_ADMIN', 'SYSTEM_ANALYST', 'ADMIN', 'DEVELOPER', 'PROGRAMMER']);
const MANAGER_ROLES = new Set(['POWER_USER', 'MANAGER', 'SUPERVISOR', 'PLANT_MANAGER']);

export function resolvePersona(roles: string[]): PersonaKind {
  const normalized = roles.map((role) => role.trim().toUpperCase()).filter(Boolean);

  if (normalized.some((role) => PROGRAMMER_ROLES.has(role))) {
    return 'programmer';
  }

  if (normalized.some((role) => MANAGER_ROLES.has(role))) {
    return 'manager';
  }

  return 'staff';
}

export function personaRoute(persona: PersonaKind): PersonaRoute {
  switch (persona) {
    case 'programmer':
      return {
        persona,
        label: 'Programmer',
        description: 'Design metadata, workflows, and publish applications in RediOS Studio.',
        href: '/studio',
        applicationCode: 'REDIOS_STUDIO',
      };
    case 'manager':
      return {
        persona,
        label: 'Manager',
        description: 'Supervise operations, approvals, and exception-driven dashboards from your workspace.',
        href: '/workspace',
        applicationCode: 'ASSET_MAINTENANCE',
      };
    default:
      return {
        persona,
        label: 'Staff',
        description: 'Execute assigned tasks, approvals, and field work from your workspace.',
        href: '/workspace',
        applicationCode: 'ASSET_MAINTENANCE',
      };
  }
}

export function postLoginDestination(roles: string[]): string {
  const persona = resolvePersona(roles);
  if (persona === 'programmer') {
    return '/studio';
  }
  return '/workspace';
}

export function allPersonaRoutes(): PersonaRoute[] {
  return [
    personaRoute('programmer'),
    personaRoute('manager'),
    personaRoute('staff'),
  ];
}
