import type { ValidationResult } from './metadata-validation';
import type { DependencyImpact } from './dependency-definition';

export type SimulationTraceMode = 'NONE' | 'RETURN_ONLY' | 'STORE';

export type SimulationStepStage =
  | 'VALIDATION'
  | 'ACTION'
  | 'SECURITY'
  | 'SECURITY_POLICY'
  | 'WORKFLOW'
  | 'PROCESS'
  | 'BUSINESS'
  | 'EVENT'
  | 'LEDGER';

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
  roles?: string[];
  groups?: string[];
  attributes?: Record<string, unknown>;
  platform?: 'WEB' | 'MOBILE' | 'TABLET';
  device?: string;
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
  traceId?: string;
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
    ledger?: {
      impacts: string[];
    };
    relations?: Array<{
      relation: string;
      status: 'VALID';
      target: string;
      lookup: boolean;
    }>;
    views?: Array<{
      code: string;
      valid: boolean;
    }>;
    ui?: {
      pages: Array<{
        code: string;
        template: string;
        atoms: number;
      }>;
    };
    forms?: Array<{
      code: string;
      fields: number;
      lookups: number;
    }>;
    designer?: {
      operation: string;
      impact: string[];
    };
    dependencies?: Array<{
      change: string;
      breaking: number;
      warnings: number;
      impacts: DependencyImpact[];
    }>;
    theme?: {
      code: string;
      affectedPages: number;
    };
    navigation?: {
      code: string;
      affectedMenus: number;
    };
    security?: {
      hiddenFields: number;
      readonlyFields: number;
      deniedActions: string[];
    };
    experience?: {
      selected: string;
      platform: string;
      page: string;
    };
    sync?: {
      offline: boolean;
      strategy: string;
      conflict: string;
    };
  };
}
