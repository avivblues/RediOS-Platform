import { ForbiddenException, Injectable } from '@nestjs/common';
import type { RuntimeContext } from '@redios/shared';

export type DesignerPermission = 'FORM.DESIGN' | 'FORM.PUBLISH';

@Injectable()
export class DesignerPermissionGuard {
  assert(context: RuntimeContext, permission: DesignerPermission): void {
    if (this.hasPermission(context, permission)) {
      return;
    }

    throw new ForbiddenException(`Missing designer permission: ${permission}`);
  }

  private hasPermission(context: RuntimeContext, permission: DesignerPermission): boolean {
    if (context.permissions.includes(permission)) {
      return true;
    }

    if (permission.startsWith('FORM.') && context.permissions.includes('builder.*')) {
      return true;
    }

    if (context.permissions.includes('metadata.*')) {
      return true;
    }

    return false;
  }
}
