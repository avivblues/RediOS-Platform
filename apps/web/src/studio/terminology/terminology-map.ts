export type StudioTerminologyMode = 'SIMPLE_MODE' | 'EXPERT_MODE';

export type StudioTermCode =
  | 'APPLICATION'
  | 'ENTITY'
  | 'FIELD'
  | 'FORM'
  | 'VIEW'
  | 'WORKFLOW'
  | 'RELATION'
  | 'VALIDATION'
  | 'SECURITY_POLICY'
  | 'INTEGRATION'
  | 'RUNTIME_PACKAGE';

export const STUDIO_TERMINOLOGY: Record<StudioTerminologyMode, Record<StudioTermCode, string>> = {
  SIMPLE_MODE: {
    APPLICATION: 'Application',
    ENTITY: 'Data Object',
    FIELD: 'Information',
    FORM: 'Input Screen',
    VIEW: 'List Screen',
    WORKFLOW: 'Process',
    RELATION: 'Connection',
    VALIDATION: 'Rule',
    SECURITY_POLICY: 'Permission',
    INTEGRATION: 'Connector',
    RUNTIME_PACKAGE: 'Published Version',
  },
  EXPERT_MODE: {
    APPLICATION: 'Application',
    ENTITY: 'Entity',
    FIELD: 'Field',
    FORM: 'Form',
    VIEW: 'View',
    WORKFLOW: 'Workflow',
    RELATION: 'Relation',
    VALIDATION: 'Validation',
    SECURITY_POLICY: 'Security Policy',
    INTEGRATION: 'Integration',
    RUNTIME_PACKAGE: 'Runtime Package',
  },
};
