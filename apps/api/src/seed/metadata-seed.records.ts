import type {
  ActionDefinition,
  ApplicationDefinition,
  EntityDefinition,
  FieldDefinition,
  MetadataDefinition,
  ProcessDefinition,
  WorkflowDefinition,
} from '@redios/shared';

const tenantId = '1';
const domainCode = '1.26.1.0';
const applicationCode = 'MAINTENANCE';
const entityCode = 'ASSET';
const workflowCode = 'MAINTENANCE_LIFECYCLE';
const processCode = 'APPROVE_PROCESS';

export const metadataSeedRecords: MetadataDefinition[] = [
  {
    tenantId,
    domainCode,
    applicationCode,
    type: 'APPLICATION',
    code: applicationCode,
    name: 'Maintenance',
    version: 1,
    enabled: true,
    definition: {
      code: applicationCode,
      name: 'Maintenance',
      capabilities: [],
      entityCodes: [entityCode],
      enabled: true,
    } satisfies ApplicationDefinition,
  },
  {
    tenantId,
    domainCode,
    applicationCode,
    type: 'ENTITY',
    code: entityCode,
    name: 'Asset',
    version: 1,
    enabled: true,
    definition: {
      code: entityCode,
      name: 'Asset',
      type: 'MASTER',
      fieldCodes: ['assetName', 'serialNo', 'location', 'status'],
      actionCodes: ['CREATE', 'READ', 'UPDATE', 'APPROVE', 'CANCEL'],
      workflowCode,
      enabled: true,
    } satisfies EntityDefinition,
  },
  ...['assetName', 'serialNo', 'location', 'status'].map(
    (fieldCode): MetadataDefinition<FieldDefinition> => ({
      tenantId,
      domainCode,
      applicationCode,
      type: 'FIELD',
      code: fieldCode,
      name: fieldCode,
      version: 1,
      enabled: true,
      definition: {
        code: fieldCode,
        name: fieldCode,
        entityCode,
        dataType: 'string',
        required: fieldCode === 'assetName',
        visible: true,
        readonly: false,
      },
    }),
  ),
  ...['CREATE', 'READ', 'UPDATE', 'APPROVE', 'CANCEL'].map(
    (actionCode): MetadataDefinition<ActionDefinition> => ({
      tenantId,
      domainCode,
      applicationCode,
      type: 'ACTION',
      code: actionCode,
      name: actionCode,
      version: 1,
      enabled: true,
      definition: {
        code: actionCode,
        entityCode,
        label: actionCode.charAt(0) + actionCode.slice(1).toLowerCase(),
        type: actionCode as ActionDefinition['type'],
        enabled: true,
        permissions: [`${entityCode}.${actionCode}`],
        behavior: {
          requiresApproval: actionCode === 'APPROVE',
          confirmation: actionCode === 'CANCEL',
        },
      },
    }),
  ),
  {
    tenantId,
    domainCode,
    applicationCode,
    type: 'WORKFLOW',
    code: workflowCode,
    name: 'Maintenance Lifecycle',
    version: 1,
    enabled: true,
    definition: {
      code: workflowCode,
      entityCode,
      states: [
        {
          code: 'DRAFT',
          label: 'Draft',
          initial: true,
        },
        {
          code: 'APPROVED',
          label: 'Approved',
        },
        {
          code: 'CANCELLED',
          label: 'Cancelled',
          final: true,
        },
      ],
      transitions: [
        {
          code: 'APPROVE',
          from: 'DRAFT',
          to: 'APPROVED',
          actionCode: 'APPROVE',
        },
        {
          code: 'CANCEL',
          from: 'DRAFT',
          to: 'CANCELLED',
          actionCode: 'CANCEL',
        },
      ],
      enabled: true,
    } satisfies WorkflowDefinition,
  },
  {
    tenantId,
    domainCode,
    applicationCode,
    type: 'PROCESS',
    code: processCode,
    name: 'Approve Process',
    version: 1,
    enabled: true,
    definition: {
      code: processCode,
      entityCode,
      trigger: {
        actionCode: 'APPROVE',
        workflowState: 'APPROVED',
      },
      steps: [
        {
          code: 'VALIDATE',
          type: 'VALIDATION',
          order: 1,
          enabled: true,
        },
        {
          code: 'BUSINESS_ENGINE',
          type: 'BUSINESS',
          order: 2,
          enabled: true,
        },
        {
          code: 'EVENT_ENGINE',
          type: 'EVENT',
          order: 3,
          enabled: true,
        },
      ],
      enabled: true,
    } satisfies ProcessDefinition,
  },
];
