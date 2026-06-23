import { Injectable } from '@nestjs/common';
import type { RuntimeDocument } from '@redios/shared';
import type { ApprovalLevelDefinition, ApprovalStepConfig, ResolvedApprovalLevel } from './approval.policy';

@Injectable()
export class ApprovalAssignment {
  resolveLevels(document: RuntimeDocument, config: ApprovalStepConfig): ResolvedApprovalLevel[] {
    const levels = config.approvalLevels ?? [];

    if (levels.length === 0) {
      return [];
    }

    const amountField = config.amountField ?? 'amount';
    const amount = this.readAmount(document, amountField);

    return levels
      .map((level, index) => ({ level: index + 1, definition: level }))
      .filter(({ definition }) => amount >= (definition.minAmount ?? 0))
      .map(({ level, definition }) => ({
        level,
        role: definition.role,
        label: definition.label ?? definition.role,
      }));
  }

  resolveSingleRoles(config: ApprovalStepConfig): string[] {
    if (Array.isArray(config.assigneeRoles) && config.assigneeRoles.length > 0) {
      return config.assigneeRoles.map(String);
    }

    if (config.targetRole) {
      return [String(config.targetRole)];
    }

    return ['SUPERVISOR'];
  }

  private readAmount(document: RuntimeDocument, field: string): number {
    const raw = document.data?.[field];
    const parsed = typeof raw === 'number' ? raw : Number(raw);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  toLevelDefinition(level: ApprovalLevelDefinition, index: number): ResolvedApprovalLevel {
    return {
      level: index + 1,
      role: level.role,
      label: level.label ?? level.role,
    };
  }
}
