import type {
  ActionDefinition,
  ActionType,
  ApplicationDefinition,
  BusinessDefinition,
  EntityType,
  EntityDefinition,
  FieldDataType,
  FieldDefinition,
  MetadataDefinition,
  ProcessDefinition,
  WorkflowDefinition,
} from '@redios/shared';

const tenantId = 'demo';
const domainCode = 'DEFAULT';

type FieldSeed = {
  code: string;
  dataType?: FieldDataType;
  required?: boolean;
};

type EntitySeed = {
  code: string;
  name: string;
  type: EntityType;
  fields: FieldSeed[];
  actions: string[];
  workflow?: WorkflowDefinition;
  processes?: ProcessDefinition[];
  businesses?: BusinessDefinition[];
};

type ApplicationSeed = {
  code: string;
  name: string;
  entities: EntitySeed[];
};

const applications: ApplicationSeed[] = [
  {
    code: 'ASSET_MAINTENANCE',
    name: 'Asset Maintenance',
    entities: [
      {
        code: 'ASSET',
        name: 'Asset',
        type: 'MASTER',
        fields: [
          { code: 'assetName', required: true },
          { code: 'serialNumber' },
          { code: 'location' },
          { code: 'status' },
        ],
        actions: ['CREATE', 'READ', 'UPDATE', 'ACTIVATE', 'DISABLE'],
        workflow: {
          code: 'ASSET_LIFECYCLE',
          entityCode: 'ASSET',
          states: [
            { code: 'NEW', label: 'New', initial: true },
            { code: 'ACTIVE', label: 'Active' },
            { code: 'INACTIVE', label: 'Inactive', final: true },
          ],
          transitions: [
            { code: 'ACTIVATE', from: 'NEW', to: 'ACTIVE', actionCode: 'ACTIVATE' },
            { code: 'DISABLE', from: 'ACTIVE', to: 'INACTIVE', actionCode: 'DISABLE' },
          ],
          enabled: true,
        },
      },
      {
        code: 'WORK_ORDER',
        name: 'Work Order',
        type: 'DOCUMENT',
        fields: [
          { code: 'title', required: true },
          { code: 'description' },
          { code: 'priority' },
          { code: 'assignedTo' },
        ],
        actions: ['CREATE', 'READ', 'UPDATE', 'START', 'COMPLETE', 'CANCEL'],
        workflow: {
          code: 'WORK_ORDER_LIFECYCLE',
          entityCode: 'WORK_ORDER',
          states: [
            { code: 'OPEN', label: 'Open', initial: true },
            { code: 'IN_PROGRESS', label: 'In Progress' },
            { code: 'DONE', label: 'Done', final: true },
            { code: 'CANCELLED', label: 'Cancelled', final: true },
          ],
          transitions: [
            { code: 'START', from: 'OPEN', to: 'IN_PROGRESS', actionCode: 'START' },
            { code: 'COMPLETE', from: 'IN_PROGRESS', to: 'DONE', actionCode: 'COMPLETE' },
            { code: 'CANCEL', from: 'OPEN', to: 'CANCELLED', actionCode: 'CANCEL' },
          ],
          enabled: true,
        },
        processes: [
          {
            code: 'WORK_ORDER_START_PROCESS',
            entityCode: 'WORK_ORDER',
            trigger: {
              actionCode: 'START',
              workflowState: 'IN_PROGRESS',
            },
            steps: [
              { code: 'VALIDATE', type: 'VALIDATION', order: 1, enabled: true },
              { code: 'EVENT_ENGINE', type: 'EVENT', order: 2, enabled: true },
            ],
            enabled: true,
          },
          {
            code: 'WORK_ORDER_COMPLETE_PROCESS',
            entityCode: 'WORK_ORDER',
            trigger: {
              actionCode: 'COMPLETE',
              workflowState: 'DONE',
            },
            steps: [
              { code: 'VALIDATE', type: 'VALIDATION', order: 1, enabled: true },
              { code: 'EVENT_ENGINE', type: 'EVENT', order: 2, enabled: true },
            ],
            enabled: true,
          },
        ],
      },
    ],
  },
  {
    code: 'CRM',
    name: 'CRM',
    entities: [
      {
        code: 'CUSTOMER',
        name: 'Customer',
        type: 'MASTER',
        fields: [{ code: 'customerName', required: true }, { code: 'email' }, { code: 'phone' }],
        actions: ['CREATE', 'READ', 'UPDATE'],
        workflow: {
          code: 'CUSTOMER_LIFECYCLE',
          entityCode: 'CUSTOMER',
          states: [{ code: 'ACTIVE', label: 'Active', initial: true }],
          transitions: [],
          enabled: true,
        },
      },
    ],
  },
  {
    code: 'WAREHOUSE',
    name: 'Warehouse',
    entities: [
      {
        code: 'RECEIVING',
        name: 'Receiving',
        type: 'DOCUMENT',
        fields: [{ code: 'itemName', required: true }, { code: 'quantity' }, { code: 'status' }],
        actions: ['CREATE', 'READ', 'UPDATE', 'RECEIVE'],
        workflow: {
          code: 'RECEIVING_LIFECYCLE',
          entityCode: 'RECEIVING',
          states: [
            { code: 'DRAFT', label: 'Draft', initial: true },
            { code: 'RECEIVED', label: 'Received', final: true },
          ],
          transitions: [{ code: 'RECEIVE', from: 'DRAFT', to: 'RECEIVED', actionCode: 'RECEIVE' }],
          enabled: true,
        },
        processes: [
          {
            code: 'RECEIVE_PROCESS',
            entityCode: 'RECEIVING',
            trigger: {
              actionCode: 'RECEIVE',
              workflowState: 'RECEIVED',
            },
            steps: [
              { code: 'VALIDATE', type: 'VALIDATION', order: 1, enabled: true },
              { code: 'BUSINESS_RULE', type: 'BUSINESS', order: 2, enabled: true },
            ],
            enabled: true,
          },
        ],
        businesses: [
          {
            code: 'RECEIVE_BUSINESS',
            entityCode: 'RECEIVING',
            trigger: {
              processCode: 'RECEIVE_PROCESS',
              stepCode: 'BUSINESS_RULE',
            },
            rules: [
              {
                code: 'VALIDATE_QUANTITY_REQUIRED',
                type: 'VALIDATE_REQUIRED_FIELD',
                enabled: true,
                config: {
                  field: 'quantity',
                },
              },
              {
                code: 'SET_RECEIVED_STATUS',
                type: 'SET_FIELD_VALUE',
                enabled: true,
                config: {
                  field: 'status',
                  value: 'RECEIVED',
                },
              },
            ],
            enabled: true,
          },
        ],
      },
    ],
  },
  {
    code: 'HELPDESK',
    name: 'Helpdesk Ticket Management',
    entities: [
      {
        code: 'TICKET',
        name: 'Ticket',
        type: 'DOCUMENT',
        fields: [
          { code: 'title', required: true },
          { code: 'description' },
          { code: 'priority' },
          { code: 'category' },
          { code: 'requester' },
          { code: 'assignee' },
          { code: 'resolution' },
          { code: 'status' },
        ],
        actions: ['CREATE', 'READ', 'UPDATE', 'ASSIGN', 'START', 'RESOLVE', 'CLOSE', 'REOPEN'],
        workflow: {
          code: 'TICKET_LIFECYCLE',
          entityCode: 'TICKET',
          states: [
            { code: 'OPEN', label: 'Open', initial: true },
            { code: 'ASSIGNED', label: 'Assigned' },
            { code: 'IN_PROGRESS', label: 'In Progress' },
            { code: 'RESOLVED', label: 'Resolved' },
            { code: 'CLOSED', label: 'Closed', final: true },
          ],
          transitions: [
            { code: 'ASSIGN', from: 'OPEN', to: 'ASSIGNED', actionCode: 'ASSIGN' },
            { code: 'START', from: 'ASSIGNED', to: 'IN_PROGRESS', actionCode: 'START' },
            { code: 'RESOLVE', from: 'IN_PROGRESS', to: 'RESOLVED', actionCode: 'RESOLVE' },
            { code: 'CLOSE', from: 'RESOLVED', to: 'CLOSED', actionCode: 'CLOSE' },
            { code: 'REOPEN', from: 'RESOLVED', to: 'IN_PROGRESS', actionCode: 'REOPEN' },
          ],
          enabled: true,
        },
        processes: [
          {
            code: 'TICKET_ASSIGN_PROCESS',
            entityCode: 'TICKET',
            trigger: {
              actionCode: 'ASSIGN',
              workflowState: 'ASSIGNED',
            },
            steps: [
              { code: 'VALIDATE', type: 'VALIDATION', order: 1, enabled: true },
              { code: 'BUSINESS', type: 'BUSINESS', order: 2, enabled: true },
            ],
            enabled: true,
          },
          {
            code: 'TICKET_START_PROCESS',
            entityCode: 'TICKET',
            trigger: {
              actionCode: 'START',
              workflowState: 'IN_PROGRESS',
            },
            steps: [
              { code: 'VALIDATE', type: 'VALIDATION', order: 1, enabled: true },
              { code: 'BUSINESS', type: 'BUSINESS', order: 2, enabled: true },
            ],
            enabled: true,
          },
          {
            code: 'TICKET_RESOLVE_PROCESS',
            entityCode: 'TICKET',
            trigger: {
              actionCode: 'RESOLVE',
              workflowState: 'RESOLVED',
            },
            steps: [
              { code: 'VALIDATE', type: 'VALIDATION', order: 1, enabled: true },
              { code: 'BUSINESS', type: 'BUSINESS', order: 2, enabled: true },
            ],
            enabled: true,
          },
        ],
        businesses: [
          {
            code: 'TICKET_ASSIGN_BUSINESS',
            entityCode: 'TICKET',
            trigger: {
              processCode: 'TICKET_ASSIGN_PROCESS',
              stepCode: 'BUSINESS',
            },
            rules: [
              {
                code: 'VALIDATE_ASSIGNEE_REQUIRED',
                type: 'VALIDATE_REQUIRED_FIELD',
                enabled: true,
                config: {
                  field: 'assignee',
                },
              },
            ],
            enabled: true,
          },
          {
            code: 'TICKET_START_BUSINESS',
            entityCode: 'TICKET',
            trigger: {
              processCode: 'TICKET_START_PROCESS',
              stepCode: 'BUSINESS',
            },
            rules: [
              {
                code: 'SET_IN_PROGRESS_STATUS',
                type: 'SET_FIELD_VALUE',
                enabled: true,
                config: {
                  field: 'status',
                  value: 'IN_PROGRESS',
                },
              },
            ],
            enabled: true,
          },
          {
            code: 'TICKET_RESOLVE_BUSINESS',
            entityCode: 'TICKET',
            trigger: {
              processCode: 'TICKET_RESOLVE_PROCESS',
              stepCode: 'BUSINESS',
            },
            rules: [
              {
                code: 'VALIDATE_RESOLUTION_REQUIRED',
                type: 'VALIDATE_REQUIRED_FIELD',
                enabled: true,
                config: {
                  field: 'resolution',
                },
              },
              {
                code: 'SET_RESOLVED_AT',
                type: 'SET_FIELD_VALUE',
                enabled: true,
                config: {
                  field: 'resolvedAt',
                  value: 'now',
                },
              },
            ],
            enabled: true,
          },
        ],
      },
    ],
  },
];

export const metadataSeedRecords: MetadataDefinition[] = applications.flatMap((application) => [
  createApplicationRecord(application),
  ...application.entities.flatMap((entity) => createEntityRecords(application, entity)),
]);

function createApplicationRecord(application: ApplicationSeed): MetadataDefinition<ApplicationDefinition> {
  return {
    tenantId,
    domainCode,
    applicationCode: application.code,
    type: 'APPLICATION',
    code: application.code,
    name: application.name,
    version: 1,
    enabled: true,
    definition: {
      code: application.code,
      name: application.name,
      capabilities: [],
      entityCodes: application.entities.map((entity) => entity.code),
      enabled: true,
    },
  };
}

function createEntityRecords(application: ApplicationSeed, entity: EntitySeed): MetadataDefinition[] {
  return [
    createEntityRecord(application, entity),
    ...entity.fields.map((field) => createFieldRecord(application, entity, field)),
    ...entity.actions.map((actionCode) => createActionRecord(application, entity, actionCode)),
    ...(entity.workflow ? [createWorkflowRecord(application, entity.workflow)] : []),
    ...(entity.processes ?? []).map((process) => createProcessRecord(application, process)),
    ...(entity.businesses ?? []).map((business) => createBusinessRecord(application, business)),
  ];
}

function createEntityRecord(
  application: ApplicationSeed,
  entity: EntitySeed,
): MetadataDefinition<EntityDefinition> {
  return {
    tenantId,
    domainCode,
    applicationCode: application.code,
    type: 'ENTITY',
    code: entity.code,
    name: entity.name,
    version: 1,
    enabled: true,
    definition: {
      code: entity.code,
      name: entity.name,
      type: entity.type,
      fieldCodes: entity.fields.map((field) => field.code),
      actionCodes: entity.actions,
      workflowCode: entity.workflow?.code,
      enabled: true,
    },
  };
}

function createFieldRecord(
  application: ApplicationSeed,
  entity: EntitySeed,
  field: FieldSeed,
): MetadataDefinition<FieldDefinition> {
  return {
    tenantId,
    domainCode,
    applicationCode: application.code,
    type: 'FIELD',
    code: field.code,
    name: field.code,
    version: 1,
    enabled: true,
    definition: {
      code: field.code,
      name: field.code,
      entityCode: entity.code,
      dataType: field.dataType ?? 'string',
      required: field.required ?? false,
      visible: true,
      readonly: false,
    },
  };
}

function createActionRecord(
  application: ApplicationSeed,
  entity: EntitySeed,
  actionCode: string,
): MetadataDefinition<ActionDefinition> {
  return {
    tenantId,
    domainCode,
    applicationCode: application.code,
    type: 'ACTION',
    code: actionCode,
    name: actionCode,
    version: 1,
    enabled: true,
    definition: {
      code: actionCode,
      entityCode: entity.code,
      label: toLabel(actionCode),
      type: toActionType(actionCode),
      enabled: true,
      permissions: [`${entity.code}.${actionCode}`],
      behavior: {
        requiresApproval: false,
        confirmation: ['CANCEL', 'DISABLE'].includes(actionCode),
      },
    },
  };
}

function createWorkflowRecord(
  application: ApplicationSeed,
  workflow: WorkflowDefinition,
): MetadataDefinition<WorkflowDefinition> {
  return {
    tenantId,
    domainCode,
    applicationCode: application.code,
    type: 'WORKFLOW',
    code: workflow.code,
    name: toLabel(workflow.code),
    version: 1,
    enabled: true,
    definition: workflow,
  };
}

function createProcessRecord(
  application: ApplicationSeed,
  process: ProcessDefinition,
): MetadataDefinition<ProcessDefinition> {
  return {
    tenantId,
    domainCode,
    applicationCode: application.code,
    type: 'PROCESS',
    code: process.code,
    name: toLabel(process.code),
    version: 1,
    enabled: true,
    definition: process,
  };
}

function createBusinessRecord(
  application: ApplicationSeed,
  business: BusinessDefinition,
): MetadataDefinition<BusinessDefinition> {
  return {
    tenantId,
    domainCode,
    applicationCode: application.code,
    type: 'BUSINESS',
    code: business.code,
    name: toLabel(business.code),
    version: 1,
    enabled: true,
    definition: business,
  };
}

function toActionType(actionCode: string): ActionType {
  if (['CREATE', 'READ', 'UPDATE', 'APPROVE', 'CANCEL'].includes(actionCode)) {
    return actionCode as ActionType;
  }

  return 'CUSTOM';
}

function toLabel(code: string): string {
  return code
    .split('_')
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ');
}
