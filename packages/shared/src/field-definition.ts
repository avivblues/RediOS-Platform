export type FieldDataType = 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';

export interface FieldDefinition {
  code: string;
  name: string;
  entityCode: string;
  dataType: FieldDataType;
  required: boolean;
  defaultValue?: unknown;
  visible: boolean;
  readonly: boolean;
  validation?: Record<string, unknown>;
}
