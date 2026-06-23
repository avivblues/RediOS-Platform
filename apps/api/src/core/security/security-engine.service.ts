import { ForbiddenException, Injectable } from '@nestjs/common';
import type { ActionDefinition, MetadataDefinition, RuntimeContext } from '@redios/shared';
import { CapabilityRegistry } from '../../platform/capability/capability-registry.service';

@Injectable()
export class SecurityEngine {
  constructor(private readonly capabilityRegistry: CapabilityRegistry) {}

  validateContext(context: RuntimeContext): void {
    if (!context.userId || !context.tenantId || !context.domainCode || !context.applicationCode) {
      throw new ForbiddenException('Runtime context is incomplete.');
    }
  }

  async validateActionAccess(context: RuntimeContext, action: MetadataDefinition<ActionDefinition>): Promise<void> {
    this.validateContext(context);

    if (action.definition.capabilityCode) {
      await this.assertCapability(context, action.definition.capabilityCode);
    }

    const permissions = action.definition.permissions ?? [];
    const missingPermissions = permissions.filter(
      (permissionCode) => !this.hasPermission(context, permissionCode),
    );

    if (missingPermissions.length > 0) {
      throw new ForbiddenException(`Missing permissions: ${missingPermissions.join(', ')}`);
    }
  }

  async assertCapability(context: RuntimeContext, capabilityCode: string): Promise<void> {
    this.validateContext(context);
    const capability = await this.capabilityRegistry.getByCode(capabilityCode);
    const requiredPermissions = capability.permissions ?? [];

    if (requiredPermissions.length === 0) {
      return;
    }

    const missingPermissions = requiredPermissions.filter(
      (permissionCode) => !this.hasPermission(context, permissionCode),
    );

    if (missingPermissions.length > 0) {
      throw new ForbiddenException(`Missing capability permissions for ${capabilityCode}: ${missingPermissions.join(', ')}`);
    }
  }

  private hasPermission(context: RuntimeContext, permissionCode: string): boolean {
    if (context.permissions.includes('*')) {
      return true;
    }

    if (context.permissions.includes(permissionCode)) {
      return true;
    }

    return context.permissions.some((granted) => {
      if (!granted.endsWith('.*')) {
        return false;
      }

      const prefix = granted.slice(0, -2);
      return permissionCode === prefix || permissionCode.startsWith(`${prefix}.`);
    });
  }
}
