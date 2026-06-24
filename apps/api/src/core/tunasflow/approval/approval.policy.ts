export type ApprovalMode = 'SINGLE' | 'SEQUENTIAL' | 'PARALLEL';

export interface ApprovalLevelDefinition {
  role: string;
  /** Minimum document amount (inclusive) that requires this level. */
  minAmount?: number;
  label?: string;
}

export interface ApprovalStepConfig {
  title?: string;
  actionCode?: string;
  priority?: string;
  assigneeRoles?: string[];
  targetRole?: string;
  approvalMode?: ApprovalMode;
  amountField?: string;
  approvalLevels?: ApprovalLevelDefinition[];
  slaHours?: number;
  /** Role to reassign when SLA is breached */
  escalationRole?: string;
  /** Hours after dueAt before escalation (defaults to 0 = immediate on overdue) */
  escalationAfterHours?: number;
  condition?: unknown;
  when?: unknown;
}

export interface ResolvedApprovalLevel {
  level: number;
  role: string;
  label: string;
}
