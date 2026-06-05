import { ForbiddenException, Injectable } from '@nestjs/common';
import type { ActionDefinition, MetadataDefinition, RuntimeContext } from '@redios/shared';

@Injectable()
export class SecurityEngine {
  validateContext(context: RuntimeContext): void {
    if (!context.userId || !context.tenantId || !context.domainCode || !context.applicationCode) {
      throw new ForbiddenException('Runtime context is incomplete.');
    }
  }

  validateActionAccess(context: RuntimeContext, action: MetadataDefinition<ActionDefinition>): void {
    this.validateContext(context);

    const permissions = action.definition.permissions ?? [];
    const missingPermissions = permissions.filter(
      (permissionCode) => !context.permissions.includes(permissionCode),
    );

    if (missingPermissions.length > 0) {
      throw new ForbiddenException(`Missing permissions: ${missingPermissions.join(', ')}`);
    }
  }
}
