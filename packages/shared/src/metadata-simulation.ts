import type { ValidationResult } from './metadata-validation';

export type SimulationTraceMode = 'NONE' | 'RETURN_ONLY' | 'STORE';

export type SimulationStepStage = 'VALIDATION' | 'ACTION' | 'SECURITY' | 'WORKFLOW' | 'PROCESS' | 'BUSINESS' | 'EVENT';

export type SimulationStepStatus = 'SUCCESS' | 'FAILED' | 'SKIPPED' | 'READY';

export interface SimulationRequest {
  tenantId: string;
  domainCode: string;
  applicationCode: string;
  entityCode: string;
  actionCode: string;
  currentState?: string;
  payload?: Record<string, unknown>;
  mockDocument?: Record<string, unknown>;
  userId?: string;
  permissions?: string[];
  traceMode?: SimulationTraceMode;
}

export interface SimulationStep {
  stage: SimulationStepStage;
  status: SimulationStepStatus;
  message: string;
  result?: unknown;
  error?: {
    code: string;
    message: string;
  };
}

export interface SimulationResult {
  success: boolean;
  validation: ValidationResult;
  steps: SimulationStep[];
  predicted: {
    workflow?: {
      from: string;
      to: string;
    };
    process?: {
      executed: boolean;
      processCode?: string;
    };
    business?: {
      rules: unknown[];
    };
    events?: {
      events: string[];
      handlers: string[];
    };
  };
}
