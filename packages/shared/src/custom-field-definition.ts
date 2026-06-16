export type CustomFieldDataType =
  | 'text'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'select'
  | 'multiselect'
  | 'reference';

export interface CustomFieldDefinition {
  id: string;
  tenantId: string;
  entity: string;
  fieldName: string;
  label?: string;
  dataType: CustomFieldDataType;
  createdBy: string;
  options?: string[];
}

export interface CustomFieldValue {
  tenantId: string;
  entity: string;
  recordId: string;
  fieldId: string;
  value: unknown;
}
