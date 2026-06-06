export type ValidationSeverity = 'ERROR' | 'WARNING' | 'INFO';

export interface ValidationIssue {
  code: string;
  severity: ValidationSeverity;
  message: string;
  path: string;
  suggestion?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: number;
  warnings: number;
  issues: ValidationIssue[];
}
