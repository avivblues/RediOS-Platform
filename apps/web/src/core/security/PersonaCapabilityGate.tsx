import type { PropsWithChildren, ReactNode } from 'react';
import { hasAnyPersonaCapability } from './persona-capability';
import { PermissionGate, type SecurityPolicyResult } from './PermissionGate';

export interface PersonaCapabilityGateProps extends PropsWithChildren {
  capabilities?: string[];
  required?: string | string[];
  policy?: SecurityPolicyResult;
  fallback?: ReactNode;
}

export function PersonaCapabilityGate({
  capabilities = [],
  required,
  policy,
  children,
  fallback = null,
}: PersonaCapabilityGateProps) {
  const requiredList = required === undefined
    ? []
    : Array.isArray(required)
      ? required
      : [required];

  if (requiredList.length > 0 && !hasAnyPersonaCapability(capabilities, requiredList)) {
    return <>{fallback}</>;
  }

  return <PermissionGate policy={policy}>{children}</PermissionGate>;
}
