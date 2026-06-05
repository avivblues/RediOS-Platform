export type BusinessRuleType = 'VALIDATE_REQUIRED_FIELD' | 'SET_FIELD_VALUE' | 'CALCULATE_FIELD';

export interface BusinessTriggerDefinition {
  processCode: string;
  stepCode: string;
}

export interface BusinessRuleDefinition {
  code: string;
  type: BusinessRuleType;
  enabled: boolean;
  config?: Record<string, unknown>;
}

export interface BusinessDefinition {
  code: string;
  entityCode: string;
  trigger: BusinessTriggerDefinition;
  rules: BusinessRuleDefinition[];
  enabled: boolean;
}
