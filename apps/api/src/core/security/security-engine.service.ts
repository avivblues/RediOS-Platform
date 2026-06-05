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
    const permissionCode = action.definition.permissionCode;

    if (permissionCode && !context.permissions.includes(permissionCode)) {
      throw new ForbiddenException(`Missing permission: ${permissionCode}`);
    }
  }
}
