export type FormLayoutType = 'SINGLE_COLUMN' | 'TWO_COLUMN' | 'SECTION' | 'WIZARD';

export interface FormFieldBinding {
  source: 'FORM';
  fieldCode: string;
}

export interface FormFieldLookupDefinition {
  relationCode: string;
  viewCode: string;
}

export interface FormFieldDefinition {
  fieldCode: string;
  component: string;
  order: number;
  required?: boolean;
  readonly?: boolean;
  visible?: boolean;
  binding?: FormFieldBinding;
  validation?: Record<string, unknown>;
  lookup?: FormFieldLookupDefinition;
}

export interface FormSectionDefinition {
  code: string;
  title: string;
  order: number;
  fields: FormFieldDefinition[];
}

export interface FormLayoutDefinition {
  type: FormLayoutType;
  sections: FormSectionDefinition[];
}

export interface FormDefinition {
  code: string;
  entityCode: string;
  name: string;
  version: number;
  enabled: boolean;
  layout: FormLayoutDefinition;
}
