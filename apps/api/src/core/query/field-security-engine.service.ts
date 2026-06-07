import { Injectable } from '@nestjs/common';
import type { RuntimeContext, ViewColumnDefinition } from '@redios/shared';
import { SecurityPolicyEngine } from '../security-policy/security-policy-engine.service';

@Injectable()
export class FieldSecurityEngine {
  constructor(private readonly securityPolicyEngine: SecurityPolicyEngine) {}

  async filterVisibleColumns(
    context: RuntimeContext,
    entityCode: string,
    columns: ViewColumnDefinition[],
  ): Promise<ViewColumnDefinition[]> {
    const access = await Promise.all(
      columns.map((column) => this.securityPolicyEngine.evaluateFieldAccess(context, entityCode, column.field)),
    );

    return columns.filter((_, index) => access[index].visible && access[index].allowed);
  }
}
