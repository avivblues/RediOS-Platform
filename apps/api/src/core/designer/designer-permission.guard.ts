import { ForbiddenException, Injectable } from '@nestjs/common';
import type { RuntimeContext } from '@redios/shared';

export type DesignerPermission = 'FORM.DESIGN' | 'FORM.PUBLISH';

@Injectable()
export class DesignerPermissionGuard {
  assert(context: RuntimeContext, permission: DesignerPermission): void {
    if (context.permissions.includes(permission)) {
      return;
    }

    throw new ForbiddenException(`Missing designer permission: ${permission}`);
  }
}
