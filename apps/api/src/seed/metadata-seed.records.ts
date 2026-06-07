import type {
  ActionDefinition,
  ActionType,
  ApplicationDefinition,
  BusinessDefinition,
  EntityType,
  EntityDefinition,
  EventDefinition,
  FieldDataType,
  FieldDefinition,
  LedgerDefinition,
  MetadataDefinition,
  ProcessDefinition,
  RelationDefinition,
  UIDefinition,
  ViewDefinition,
  WorkflowDefinition,
} from '@redios/shared';

const tenantId = 'demo';
const domainCode = 'DEFAULT';

type FieldSeed = {
  code: string;
  dataType?: FieldDataType;
  required?: boolean;
  relation?: string;
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
  events?: EventDefinition[];
  ledgers?: LedgerDefinition[];
  views?: ViewDefinition[];
};

type ApplicationSeed = {
  code: string;
  name: string;
  entities: EntitySeed[];
  relations?: RelationDefinition[];
  uis?: UIDefinition[];
};

const commonUIDefinitions: UIDefinition[] = [
  ...[
    'TEXT_INPUT',
    'TEXT_AREA',
    'NUMBER_INPUT',
    'DATE_PICKER',
    'SELECT',
    'BUTTON',
    'BADGE',
    'LABEL',
    'CARD',
    'TABLE',
    'CHART',
    'ICON',
  ].map((code): UIDefinition => ({
    kind: 'ATOM',
    code,
    category: toAtomCategory(code),
    renderer: {
      web: toRendererName(code),
      mobile: toRendererName(code),
    },
    propsSchema: defaultPropsSchema(code),
    enabled: true,
  })),
  {
    kind: 'MOLECULE',
    code: 'FORM_FIELD',
    atoms: [
      { atom: 'LABEL', bind: 'label' },
      { atom: 'TEXT_INPUT', bind: 'value' },
    ],
    enabled: true,
  },
  {
    kind: 'MOLECULE',
    code: 'SEARCH_BOX',
    atoms: [
      { atom: 'TEXT_INPUT', bind: 'query' },
      { atom: 'BUTTON', bind: 'submit' },
    ],
    enabled: true,
  },
  {
    kind: 'MOLECULE',
    code: 'ACTION_BUTTON',
    atoms: [{ atom: 'BUTTON', bind: 'action' }],
    enabled: true,
  },
  {
    kind: 'MOLECULE',
    code: 'STATUS_BADGE',
    atoms: [{ atom: 'BADGE', bind: 'status' }],
    enabled: true,
  },
  {
    kind: 'ORGANISM',
    code: 'FORM_SECTION',
    molecules: [{ molecule: 'FORM_FIELD', bind: 'fields' }],
    enabled: true,
  },
  {
    kind: 'ORGANISM',
    code: 'DATA_TABLE',
    molecules: [
      { molecule: 'SEARCH_BOX', bind: 'search' },
      { molecule: 'FORM_FIELD', bind: 'filters' },
    ],
    enabled: true,
  },
  {
    kind: 'ORGANISM',
    code: 'ACTION_BAR',
    molecules: [{ molecule: 'ACTION_BUTTON', bind: 'actions' }],
    enabled: true,
  },
  {
    kind: 'ORGANISM',
    code: 'DETAIL_CARD',
    molecules: [
      { molecule: 'STATUS_BADGE', bind: 'status' },
      { molecule: 'FORM_FIELD', bind: 'fields' },
    ],
    enabled: true,
  },
  {
    kind: 'ORGANISM',
    code: 'TIMELINE',
    molecules: [{ molecule: 'STATUS_BADGE', bind: 'events' }],
    enabled: true,
  },
  {
    kind: 'TEMPLATE',
    code: 'SINGLE_PAGE',
    regions: [{ code: 'HEADER' }, { code: 'CONTENT' }],
    enabled: true,
  },
  {
    kind: 'TEMPLATE',
    code: 'MASTER_DETAIL',
    regions: [{ code: 'HEADER' }, { code: 'CONTENT' }, { code: 'SIDEBAR' }],
    enabled: true,
  },
  {
    kind: 'TEMPLATE',
    code: 'DASHBOARD_LAYOUT',
    regions: [{ code: 'HEADER' }, { code: 'CONTENT' }, { code: 'SIDEBAR' }],
    enabled: true,
  },
];

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
          { code: 'name' },
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
        views: [
          {
            code: 'ASSET_LOOKUP',
            entityCode: 'ASSET',
            type: 'LOOKUP',
            columns: [
              { field: 'name', label: 'Name', visible: true, sortable: true, filterable: true },
              { field: 'location', label: 'Location', visible: true, sortable: true, filterable: true },
            ],
            filters: [{ field: 'name', operator: 'CONTAINS' }],
            sorting: {
              field: 'name',
              direction: 'ASC',
            },
            enabled: true,
          },
        ],
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
          { code: 'assetId', dataType: 'REFERENCE', relation: 'WORK_ORDER_ASSET_RELATION' },
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
        events: [
          {
            code: 'WORK_ORDER_STARTED_EVENT',
            entityCode: 'WORK_ORDER',
            trigger: {
              actionCode: 'START',
              workflowState: 'IN_PROGRESS',
              processCode: 'WORK_ORDER_START_PROCESS',
            },
            handlers: [
              {
                code: 'NOTIFY_SUPERVISOR',
                type: 'NOTIFICATION',
                enabled: true,
                config: {
                  targetRole: 'SUPERVISOR',
                  message: 'Work order started',
                },
              },
              {
                code: 'TRACK_CHANGE',
                type: 'AUDIT_LOG',
                enabled: true,
                config: {
                  action: 'TRACK_CHANGE',
                },
              },
            ],
            enabled: true,
          },
        ],
        views: [
          {
            code: 'WORK_ORDER_LIST',
            entityCode: 'WORK_ORDER',
            type: 'TABLE',
            columns: [
              { field: 'title', label: 'Title', visible: true, sortable: true, filterable: true },
              { field: 'priority', label: 'Priority', visible: true, sortable: true, filterable: true },
              { field: 'status', label: 'Status', visible: true, sortable: true, filterable: true },
              {
                field: 'assetId',
                label: 'Asset',
                visible: true,
                sortable: false,
                filterable: true,
                relation: 'WORK_ORDER_ASSET_RELATION',
              },
            ],
            filters: [{ field: 'status', operator: 'EQ' }],
            sorting: {
              field: 'title',
              direction: 'ASC',
            },
            enabled: true,
          },
        ],
      },
    ],
    relations: [
      {
        code: 'WORK_ORDER_ASSET_RELATION',
        source: {
          entityCode: 'WORK_ORDER',
        },
        target: {
          entityCode: 'ASSET',
        },
        type: 'MANY_TO_ONE',
        mapping: {
          sourceField: 'assetId',
          targetField: 'id',
        },
        behavior: {
          required: true,
          cascade: false,
          ownership: false,
          lookup: true,
        },
        enabled: true,
      },
    ],
    uis: [
      {
        kind: 'PAGE',
        code: 'WORK_ORDER_DETAIL_PAGE',
        entityCode: 'WORK_ORDER',
        viewCode: 'WORK_ORDER_LIST',
        template: 'MASTER_DETAIL',
        regions: {
          HEADER: ['ACTION_BAR'],
          CONTENT: ['DETAIL_CARD'],
          SIDEBAR: ['TIMELINE'],
        },
        actions: ['START', 'COMPLETE', 'CANCEL'],
        relations: ['WORK_ORDER_ASSET_RELATION'],
        enabled: true,
      },
      {
        kind: 'PAGE',
        code: 'ASSET_DETAIL_PAGE',
        entityCode: 'ASSET',
        viewCode: 'ASSET_LOOKUP',
        template: 'MASTER_DETAIL',
        regions: {
          HEADER: ['ACTION_BAR'],
          CONTENT: ['DETAIL_CARD'],
          SIDEBAR: ['TIMELINE'],
        },
        actions: ['ACTIVATE', 'DISABLE'],
        relations: [],
        enabled: true,
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
      {
        code: 'CONTACT',
        name: 'Contact',
        type: 'MASTER',
        fields: [{ code: 'contactName', required: true }, { code: 'email' }, { code: 'customerId', dataType: 'REFERENCE' }],
        actions: ['CREATE', 'READ', 'UPDATE'],
      },
    ],
    relations: [
      {
        code: 'CUSTOMER_CONTACT_RELATION',
        source: {
          entityCode: 'CUSTOMER',
        },
        target: {
          entityCode: 'CONTACT',
        },
        type: 'ONE_TO_MANY',
        mapping: {
          sourceField: 'id',
          targetField: 'customerId',
        },
        behavior: {
          required: false,
          cascade: false,
          ownership: true,
          lookup: true,
        },
        enabled: true,
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
        fields: [
          { code: 'itemName', required: true },
          { code: 'quantity' },
          { code: 'status' },
          { code: 'stockMovementId', dataType: 'REFERENCE', relation: 'RECEIVING_STOCK_MOVEMENT_RELATION' },
        ],
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
        ledgers: [
          {
            code: 'RECEIVE_LEDGER',
            entityCode: 'RECEIVING',
            trigger: {
              actionCode: 'RECEIVE',
              workflowState: 'RECEIVED',
            },
            impacts: [
              {
                code: 'CREATE_STOCK_MOVEMENT',
                type: 'CREATE_DOCUMENT',
                target: {
                  entityCode: 'STOCK_MOVEMENT',
                },
                mapping: {
                  stockItemName: 'data.itemName',
                  stockQuantity: 'data.quantity',
                },
                enabled: true,
              },
            ],
            enabled: true,
          },
        ],
      },
      {
        code: 'STOCK_MOVEMENT',
        name: 'Stock Movement',
        type: 'DOCUMENT',
        fields: [{ code: 'stockItemName' }, { code: 'stockQuantity' }],
        actions: [],
      },
    ],
    relations: [
      {
        code: 'RECEIVING_STOCK_MOVEMENT_RELATION',
        source: {
          entityCode: 'RECEIVING',
        },
        target: {
          entityCode: 'STOCK_MOVEMENT',
        },
        type: 'ONE_TO_MANY',
        mapping: {
          sourceField: 'stockMovementId',
          targetField: 'id',
        },
        behavior: {
          required: false,
          cascade: false,
          ownership: false,
          lookup: true,
        },
        enabled: true,
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
        views: [
          {
            code: 'TICKET_LIST',
            entityCode: 'TICKET',
            type: 'TABLE',
            columns: [
              { field: 'title', label: 'Title', visible: true, sortable: true, filterable: true },
              { field: 'priority', label: 'Priority', visible: true, sortable: true, filterable: true },
              { field: 'status', label: 'Status', visible: true, sortable: true, filterable: true },
            ],
            filters: [{ field: 'status', operator: 'EQ' }],
            sorting: {
              field: 'title',
              direction: 'ASC',
            },
            enabled: true,
          },
        ],
      },
    ],
    uis: [
      {
        kind: 'PAGE',
        code: 'TICKET_DETAIL_PAGE',
        entityCode: 'TICKET',
        viewCode: 'TICKET_LIST',
        template: 'MASTER_DETAIL',
        regions: {
          HEADER: ['ACTION_BAR'],
          CONTENT: ['DETAIL_CARD'],
          SIDEBAR: ['TIMELINE'],
        },
        actions: ['ASSIGN', 'START', 'RESOLVE', 'CLOSE', 'REOPEN'],
        relations: [],
        enabled: true,
      },
    ],
  },
];

export const metadataSeedRecords: MetadataDefinition[] = applications.flatMap((application) => [
  createApplicationRecord(application),
  ...application.entities.flatMap((entity) => createEntityRecords(application, entity)),
  ...(application.relations ?? []).map((relation) => createRelationRecord(application, relation)),
  ...[...commonUIDefinitions, ...(application.uis ?? [])].map((ui) => createUIRecord(application, ui)),
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
    ...(entity.events ?? []).map((event) => createEventRecord(application, event)),
    ...(entity.ledgers ?? []).map((ledger) => createLedgerRecord(application, ledger)),
    ...(entity.views ?? []).map((view) => createViewRecord(application, view)),
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
      relation: field.relation,
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

function createEventRecord(
  application: ApplicationSeed,
  event: EventDefinition,
): MetadataDefinition<EventDefinition> {
  return {
    tenantId,
    domainCode,
    applicationCode: application.code,
    type: 'EVENT',
    code: event.code,
    name: toLabel(event.code),
    version: 1,
    enabled: true,
    definition: event,
  };
}

function createLedgerRecord(
  application: ApplicationSeed,
  ledger: LedgerDefinition,
): MetadataDefinition<LedgerDefinition> {
  return {
    tenantId,
    domainCode,
    applicationCode: application.code,
    type: 'LEDGER',
    code: ledger.code,
    name: toLabel(ledger.code),
    version: 1,
    enabled: true,
    definition: ledger,
  };
}

function createRelationRecord(
  application: ApplicationSeed,
  relation: RelationDefinition,
): MetadataDefinition<RelationDefinition> {
  return {
    tenantId,
    domainCode,
    applicationCode: application.code,
    type: 'RELATION',
    code: relation.code,
    name: toLabel(relation.code),
    version: 1,
    enabled: true,
    definition: relation,
  };
}

function createViewRecord(
  application: ApplicationSeed,
  view: ViewDefinition,
): MetadataDefinition<ViewDefinition> {
  return {
    tenantId,
    domainCode,
    applicationCode: application.code,
    type: 'VIEW',
    code: view.code,
    name: toLabel(view.code),
    version: 1,
    enabled: true,
    definition: view,
  };
}

function createUIRecord(
  application: ApplicationSeed,
  ui: UIDefinition,
): MetadataDefinition<UIDefinition> {
  return {
    tenantId,
    domainCode,
    applicationCode: application.code,
    type: 'UI',
    code: ui.code,
    name: toLabel(ui.code),
    version: 1,
    enabled: true,
    definition: ui,
  };
}

function toActionType(actionCode: string): ActionType {
  if (['CREATE', 'READ', 'UPDATE', 'APPROVE', 'CANCEL'].includes(actionCode)) {
    return actionCode as ActionType;
  }

  return 'CUSTOM';
}

function toAtomCategory(code: string): 'INPUT' | 'ACTION' | 'DISPLAY' | 'DATA' | 'VISUAL' {
  if (['TEXT_INPUT', 'TEXT_AREA', 'NUMBER_INPUT', 'DATE_PICKER', 'SELECT'].includes(code)) {
    return 'INPUT';
  }

  if (code === 'BUTTON') {
    return 'ACTION';
  }

  if (['TABLE', 'CHART'].includes(code)) {
    return 'DATA';
  }

  if (['ICON', 'CARD'].includes(code)) {
    return 'VISUAL';
  }

  return 'DISPLAY';
}

function toRendererName(code: string): string {
  return code
    .split('_')
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join('');
}

function defaultPropsSchema(code: string): Record<string, string> {
  if (['TEXT_INPUT', 'TEXT_AREA', 'NUMBER_INPUT', 'DATE_PICKER', 'SELECT'].includes(code)) {
    return {
      placeholder: 'string',
      disabled: 'boolean',
    };
  }

  if (code === 'BUTTON') {
    return {
      label: 'string',
      disabled: 'boolean',
    };
  }

  return {
    label: 'string',
  };
}

function toLabel(code: string): string {
  return code
    .split('_')
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ');
}
