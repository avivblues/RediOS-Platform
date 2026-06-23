import type { PlatformPersona, PersonaMetadataDefinition, ResolvedPersona } from '@redios/shared';

const ADMIN_ROLES = new Set(['SYSTEM_ADMIN', 'ADMIN']);
const PROGRAMMER_ROLES = new Set(['SYSTEM_ANALYST', 'DEVELOPER', 'PROGRAMMER']);
const MANAGER_ROLES = new Set(['POWER_USER', 'MANAGER', 'SUPERVISOR', 'PLANT_MANAGER']);

const PERSONA_CAPABILITIES: Record<PlatformPersona, string[]> = {
  SYSTEM_ADMIN: ['platform.*', 'metadata.*', 'builder.*', 'workflow.*', 'runtime.*'],
  PROGRAMMER: ['metadata.*', 'builder.*', 'workflow.*', 'query.*', 'connector.*'],
  MANAGER: ['workflow.edit', 'form.customize', 'report.*', 'dashboard.*', 'runtime.access'],
  STAFF: ['runtime.access', 'report.read', 'dashboard.read', 'notification.read'],
};

const PERSONA_HOME: Record<PlatformPersona, string> = {
  SYSTEM_ADMIN: '/workspace',
  PROGRAMMER: '/studio',
  MANAGER: '/workspace',
  STAFF: '/workspace',
};

const PERSONA_APPLICATION: Record<PlatformPersona, string> = {
  SYSTEM_ADMIN: 'REDIOS_ADMIN',
  PROGRAMMER: 'REDIOS_STUDIO',
  MANAGER: 'ASSET_MAINTENANCE',
  STAFF: 'ASSET_MAINTENANCE',
};

export function resolvePlatformPersona(roles: string[]): PlatformPersona {
  const normalized = roles.map((role) => role.trim().toUpperCase()).filter(Boolean);

  if (normalized.some((role) => ADMIN_ROLES.has(role))) {
    return 'SYSTEM_ADMIN';
  }

  if (normalized.some((role) => PROGRAMMER_ROLES.has(role))) {
    return 'PROGRAMMER';
  }

  if (normalized.some((role) => MANAGER_ROLES.has(role))) {
    return 'MANAGER';
  }

  return 'STAFF';
}

export function fallbackPersonaDefinition(persona: PlatformPersona): PersonaMetadataDefinition {
  const labels: Record<PlatformPersona, { label: string; description: string; workspaceCode: string }> = {
    SYSTEM_ADMIN: {
      label: 'System Admin',
      description: 'Full platform control, tenant security, and builder access.',
      workspaceCode: 'SYSTEM_CONTROL_CENTER',
    },
    PROGRAMMER: {
      label: 'Programmer',
      description: 'Design metadata, workflows, and publish runtime packages.',
      workspaceCode: 'REDI_STUDIO_WORKSPACE',
    },
    MANAGER: {
      label: 'Manager',
      description: 'Supervise operations, approvals, and exception-driven dashboards.',
      workspaceCode: 'MANAGEMENT_WORKSPACE',
    },
    STAFF: {
      label: 'Staff',
      description: 'Execute daily tasks, field work, and assigned approvals.',
      workspaceCode: 'MY_WORKSPACE',
    },
  };

  const meta = labels[persona];

  return {
    persona,
    label: meta.label,
    description: meta.description,
    workspaceCode: meta.workspaceCode,
    homeRoute: PERSONA_HOME[persona],
    applicationCode: PERSONA_APPLICATION[persona],
    capabilities: PERSONA_CAPABILITIES[persona],
  };
}

export function buildResolvedPersona(
  roles: string[],
  definition: PersonaMetadataDefinition,
  capabilities: string[],
): ResolvedPersona {
  return {
    persona: definition.persona,
    label: definition.label,
    description: definition.description,
    workspaceCode: definition.workspaceCode,
    homeRoute: definition.homeRoute,
    applicationCode: definition.applicationCode,
    capabilities,
    sourceRoles: roles,
  };
}
