export type SecurityPolicyTargetType = 'APPLICATION' | 'ENTITY' | 'FIELD' | 'ACTION' | 'VIEW' | 'FORM' | 'UI';

export type SecurityPolicyEffect = 'ALLOW' | 'DENY';

export type SecurityPolicySubjectType = 'ROLE' | 'USER' | 'GROUP' | 'ATTRIBUTE';

export interface SecurityPolicyTargetDefinition {
  type: SecurityPolicyTargetType;
  code: string;
  entityCode?: string;
}

export interface SecurityPolicySubjectDefinition {
  type: SecurityPolicySubjectType;
  value: string;
}

export interface SecurityPolicyRulesDefinition {
  read?: boolean;
  create?: boolean;
  update?: boolean;
  delete?: boolean;
  visible?: boolean;
  editable?: boolean;
}

export interface SecurityPolicyConditionDefinition {
  attributes?: Record<string, unknown>;
}

export interface SecurityPolicyDefinition {
  code: string;
  name: string;
  version: number;
  target: SecurityPolicyTargetDefinition;
  effect: SecurityPolicyEffect;
  subjects: SecurityPolicySubjectDefinition[];
  rules: SecurityPolicyRulesDefinition;
  conditions?: SecurityPolicyConditionDefinition;
  enabled: boolean;
}
