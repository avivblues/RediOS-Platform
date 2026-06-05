export interface ProcessStepDefinition {
  code: string;
  order: number;
  engineCode: string;
  operation: string;
  configuration?: Record<string, unknown>;
}

export interface ProcessDefinition {
  code: string;
  name: string;
  steps: ProcessStepDefinition[];
  enabled: boolean;
}
