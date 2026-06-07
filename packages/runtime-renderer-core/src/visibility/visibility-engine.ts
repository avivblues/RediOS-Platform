export interface RuntimeNodePermissions {
  visible: boolean;
  readonly: boolean;
  disabled: boolean;
}

export interface VisibilitySource {
  visible?: boolean;
  readonly?: boolean;
  disabled?: boolean;
}

export interface SecurityPolicyVisibilityResult {
  allowed?: boolean;
  visible?: boolean;
  editable?: boolean;
}

export function resolveVisibility(
  metadata?: VisibilitySource,
  security?: SecurityPolicyVisibilityResult,
): RuntimeNodePermissions {
  const allowed = security?.allowed ?? true;
  const visible = Boolean(metadata?.visible ?? true) && Boolean(security?.visible ?? true) && allowed;
  const readonly = Boolean(metadata?.readonly ?? false) || security?.editable === false;

  return {
    visible,
    readonly,
    disabled: Boolean(metadata?.disabled ?? false) || readonly || !allowed,
  };
}
