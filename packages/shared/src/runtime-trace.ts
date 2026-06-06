export type RuntimeTraceStatus = 'RUNNING' | 'SUCCESS' | 'FAILED';

export type RuntimeTraceStepEngine = 'ACTION' | 'SECURITY' | 'WORKFLOW' | 'PROCESS' | 'BUSINESS' | 'EVENT' | 'LEDGER';

export type RuntimeTraceStepStatus = 'SUCCESS' | 'FAILED' | 'SKIPPED';

export interface RuntimeTraceStep {
  engine: RuntimeTraceStepEngine;
  status: RuntimeTraceStepStatus;
  startedAt: Date;
  finishedAt: Date;
  durationMs: number;
  input?: unknown;
  output?: unknown;
  error?: unknown;
}

export interface RuntimeTrace {
  id?: string;
  tenantId: string;
  domainCode: string;
  applicationCode: string;
  entityCode: string;
  documentId?: string;
  actionCode?: string;
  status: RuntimeTraceStatus;
  startedAt: Date;
  finishedAt?: Date;
  durationMs?: number;
  steps: RuntimeTraceStep[];
}
