import { Injectable } from '@nestjs/common';
import type { PlatformPersona, RuntimeContext } from '@redios/shared';

@Injectable()
export class PersonaCapabilityService {
  mergeCapabilities(
    personaCapabilities: string[],
    rolePermissions: string[],
    roles: string[],
  ): string[] {
    const merged = new Set<string>(personaCapabilities);

    for (const permission of rolePermissions) {
      if (permission === '*') {
        merged.add('platform.*');
        merged.add('metadata.*');
        merged.add('builder.*');
        merged.add('runtime.*');
        continue;
      }

      merged.add(permission);
    }

    for (const role of roles) {
      merged.add(role);
    }

    return [...merged];
  }

  resolveFromMetadata(
    persona: PlatformPersona,
    metadataCapabilities: string[] | undefined,
    context: RuntimeContext,
  ): string[] {
    const base = metadataCapabilities?.length
      ? metadataCapabilities
      : [];

    return this.mergeCapabilities(base, context.permissions ?? [], context.roles ?? []);
  }
}
