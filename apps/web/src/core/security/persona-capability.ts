export function matchesPersonaCapability(granted: string[], required: string): boolean {
  if (!required) {
    return true;
  }

  if (granted.includes('*')) {
    return true;
  }

  for (const capability of granted) {
    if (capability === required) {
      return true;
    }

    if (capability.endsWith('.*')) {
      const prefix = capability.slice(0, -2);
      if (required === prefix || required.startsWith(`${prefix}.`)) {
        return true;
      }
    }
  }

  return false;
}

export function hasAnyPersonaCapability(granted: string[], required: string[] | undefined): boolean {
  if (!required || required.length === 0) {
    return true;
  }

  return required.some((capability) => matchesPersonaCapability(granted, capability));
}
