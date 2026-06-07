import type { PropsWithChildren } from 'react';

export interface SecurityPolicyResult {
  allowed?: boolean;
  visible?: boolean;
  editable?: boolean;
}

export function PermissionGate({ policy, children }: PropsWithChildren<{ policy?: SecurityPolicyResult }>) {
  if (policy?.visible === false || policy?.allowed === false) {
    return null;
  }

  return <>{children}</>;
}
