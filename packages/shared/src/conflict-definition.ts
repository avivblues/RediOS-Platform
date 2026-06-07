export type ConflictResolutionStrategy = 'SERVER_WINS' | 'CLIENT_WINS' | 'MANUAL_REVIEW' | 'MERGE_FIELDS';

export interface ConflictPolicyRuleDefinition {
  fieldCode: string;
  strategy: ConflictResolutionStrategy;
}

export interface ConflictPolicyDefinition {
  code: string;
  entityCode: string;
  enabled: boolean;
  strategy: ConflictResolutionStrategy;
  rules: ConflictPolicyRuleDefinition[];
}

export interface ConflictFieldDifference {
  field: string;
  server: unknown;
  client: unknown;
}

export interface ConflictDetectionResult {
  conflict: boolean;
  conflictId?: string;
  policy?: ConflictResolutionStrategy;
  fields?: ConflictFieldDifference[];
}
