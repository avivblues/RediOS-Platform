import type { ProcessStepType } from '@redios/shared';

export type FlowStepStatus = 'READY' | 'EXECUTED' | 'FAILED' | 'SKIPPED' | 'PENDING';

export interface FlowStepResult {
  code: string;
  type: ProcessStepType;
  status: FlowStepStatus;
  output?: Record<string, unknown>;
  message?: string;
}

export interface FlowExecutionResult {
  executed: boolean;
  processCode?: string;
  steps: FlowStepResult[];
  next: 'BUSINESS_ENGINE';
}
