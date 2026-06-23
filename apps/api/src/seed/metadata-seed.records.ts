import type {
  ActionDefinition,
  ActionType,
  ApplicationDefinition,
  BusinessDefinition,
  ConflictPolicyDefinition,
  ConnectorDefinition,
  EntityType,
  EntityDefinition,
  EventDefinition,
  ExperienceDefinition,
  FieldDataType,
  FieldDefinition,
  FormDefinition,
  IntegrationDefinition,
  LedgerDefinition,
  MetadataDefinition,
  NavigationDefinition,
  ProcessDefinition,
  RelationDefinition,
  SecurityPolicyDefinition,
  SyncDefinition,
  ThemeDefinition,
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
  forms?: FormDefinition[];
};

type ApplicationSeed = {
  code: string;
  name: string;
  entities: EntitySeed[];
  relations?: RelationDefinition[];
  uis?: UIDefinition[];
  themes?: ThemeDefinition[];
  navigations?: NavigationDefinition[];
  securityPolicies?: SecurityPolicyDefinition[];
  experiences?: ExperienceDefinition[];
  syncPolicies?: SyncDefinition[];
  conflictPolicies?: ConflictPolicyDefinition[];
  connectors?: ConnectorDefinition[];
  integrations?: IntegrationDefinition[];
};

const commonThemeDefinitions: ThemeDefinition[] = [
  {
    code: 'DEFAULT_THEME',
    name: 'Default Theme',
    version: 1,
    enabled: true,
    tokens: {
      colors: {
        primary: '#00AEEF',
        secondary: '#0F172A',
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        background: '#F8FAFC',
        surface: '#FFFFFF',
        text: '#0F172A',
      },
      typography: {
        fontFamily: 'Inter',
        size: {
          small: '12px',
          medium: '14px',
          large: '18px',
        },
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
      },
      radius: {
        small: '4px',
        medium: '8px',
        large: '12px',
      },
    },
    layout: {
      navigation: 'SIDEBAR',
      density: 'NORMAL',
    },
    assets: {
      logo: 'redios-logo',
      favicon: 'redios-favicon',
    },
  },
  {
    code: 'COMPACT_THEME',
    name: 'Compact Theme',
    version: 1,
    enabled: true,
    extends: 'DEFAULT_THEME',
    tokens: {
      colors: {
        primary: '#00AEEF',
        secondary: '#0F172A',
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        background: '#F8FAFC',
        surface: '#FFFFFF',
        text: '#0F172A',
      },
      typography: {
        fontFamily: 'Inter',
        size: {
          small: '11px',
          medium: '13px',
          large: '16px',
        },
      },
      spacing: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '16px',
      },
      radius: {
        small: '3px',
        medium: '6px',
        large: '10px',
      },
    },
    layout: {
      navigation: 'TOPBAR',
      density: 'COMPACT',
    },
    assets: {
      logo: 'redios-logo',
      favicon: 'redios-favicon',
    },
  },
];

function commonNavigationDefinitions(application: ApplicationSeed): NavigationDefinition[] {
  const entityCodes = new Set(application.entities.map((entity) => entity.code));
  const items: NavigationDefinition['items'] = [];

  if (entityCodes.has('ASSET') || entityCodes.has('WORK_ORDER')) {
    items.push({
      code: 'ASSET_MANAGEMENT',
      label: 'Asset Management',
      icon: 'assets',
      order: 1,
      target: {
        type: 'URL',
        code: '#asset-management',
      },
      children: [
        ...(entityCodes.has('ASSET')
          ? [
              {
                code: 'ASSETS',
                label: 'Assets',
                icon: 'asset',
                order: 1,
                target: {
                  type: 'PAGE' as const,
                  code: 'ASSET_DETAIL_PAGE',
                },
                visibleWhen: {
                  permissions: ['ASSET.READ'],
                },
              },
            ]
          : []),
        ...(entityCodes.has('WORK_ORDER')
          ? [
              {
                code: 'WORK_ORDERS',
                label: 'Work Orders',
                icon: 'work-order',
                order: 2,
                target: {
                  type: 'PAGE' as const,
                  code: 'WORK_ORDER_DETAIL_PAGE',
                },
                visibleWhen: {
                  permissions: ['WORK_ORDER.READ'],
                },
              },
            ]
          : []),
      ],
    });
  }

  if (entityCodes.has('TICKET')) {
    items.push({
      code: 'HELPDESK',
      label: 'Helpdesk',
      icon: 'helpdesk',
      order: 2,
      target: {
        type: 'URL',
        code: '#helpdesk',
      },
      children: [
        {
          code: 'TICKETS',
          label: 'Tickets',
          icon: 'ticket',
          order: 1,
          target: {
            type: 'PAGE',
            code: 'TICKET_DETAIL_PAGE',
          },
          visibleWhen: {
            permissions: ['TICKET.READ'],
          },
        },
      ],
    });
  }

  return [
    {
      code: 'MAIN_NAVIGATION',
      name: 'Main Navigation',
      type: 'SIDEBAR',
      enabled: true,
      items,
    },
    {
      code: 'MOBILE_NAV',
      name: 'Mobile Navigation',
      type: 'MOBILE_TAB',
      enabled: true,
      items: items.flatMap((item) =>
        (item.children ?? []).map((child) => ({
          ...child,
          target:
            child.target.type === 'PAGE' && child.target.code === 'WORK_ORDER_DETAIL_PAGE'
              ? { type: 'PAGE' as const, code: 'WORK_ORDER_MOBILE_PAGE' }
              : child.target.type === 'PAGE' && child.target.code === 'ASSET_DETAIL_PAGE'
                ? { type: 'PAGE' as const, code: 'ASSET_MOBILE_PAGE' }
                : child.target,
        })),
      ),
    },
  ];
}

const commonUIDefinitions: UIDefinition[] = [
  ...[
    'TEXT_INPUT',
    'TEXT_AREA',
    'NUMBER_INPUT',
    'DATE_PICKER',
    'SELECT',
    'LOOKUP',
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
  {
    kind: 'TEMPLATE',
    code: 'MOBILE_STACK',
    regions: [{ code: 'HEADER' }, { code: 'CONTENT' }],
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
          { code: 'estimatedCost', dataType: 'number' },
          { code: 'assignedTo' },
          { code: 'assetId', dataType: 'REFERENCE', relation: 'WORK_ORDER_ASSET_RELATION' },
        ],
        actions: ['CREATE', 'READ', 'UPDATE', 'START', 'COMPLETE', 'CANCEL', 'DELETE'],
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
              {
                code: 'SUPERVISOR_VERIFY',
                type: 'HUMAN_TASK',
                order: 2,
                enabled: true,
                config: {
                  title: 'Verify work order start',
                  assigneeRoles: ['SUPERVISOR', 'MANAGER', 'SYSTEM_ADMIN'],
                  actionCode: 'APPROVE',
                  priority: 'NORMAL',
                },
              },
              { code: 'EVENT_ENGINE', type: 'EVENT', order: 3, enabled: true },
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
              { field: 'estimatedCost', label: 'Estimated Cost', visible: true, sortable: true, filterable: false },
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
        forms: [
          {
            code: 'WORK_ORDER_FORM',
            entityCode: 'WORK_ORDER',
            name: 'Work Order Form',
            version: 1,
            enabled: true,
            layout: {
              type: 'SECTION',
              sections: [
                {
                  code: 'GENERAL',
                  title: 'General',
                  order: 1,
                  fields: [
                    {
                      fieldCode: 'title',
                      component: 'TEXT_INPUT',
                      order: 1,
                      required: true,
                    },
                    {
                      fieldCode: 'description',
                      component: 'TEXT_AREA',
                      order: 2,
                    },
                    {
                      fieldCode: 'priority',
                      component: 'SELECT',
                      order: 3,
                    },
                    {
                      fieldCode: 'assetId',
                      component: 'LOOKUP',
                      order: 4,
                      required: true,
                      lookup: {
                        relationCode: 'WORK_ORDER_ASSET_RELATION',
                        viewCode: 'ASSET_LOOKUP',
                      },
                    },
                    {
                      fieldCode: 'assignedTo',
                      component: 'TEXT_INPUT',
                      order: 5,
                    },
                    {
                      fieldCode: 'estimatedCost',
                      component: 'NUMBER_INPUT',
                      order: 6,
                    },
                  ],
                },
              ],
            },
          },
        ],
      },
      {
        code: 'PURCHASE_REQUEST',
        name: 'Purchase Request',
        type: 'DOCUMENT',
        fields: [
          { code: 'title', required: true },
          { code: 'amount', dataType: 'number', required: true },
          { code: 'requester' },
          { code: 'description' },
        ],
        actions: ['CREATE', 'READ', 'UPDATE', 'SUBMIT', 'APPROVE', 'REJECT', 'DELETE'],
        workflow: {
          code: 'PR_LIFECYCLE',
          entityCode: 'PURCHASE_REQUEST',
          states: [
            { code: 'DRAFT', label: 'Draft', initial: true },
            { code: 'SUBMITTED', label: 'Submitted' },
            { code: 'APPROVED', label: 'Approved', final: true },
            { code: 'REJECTED', label: 'Rejected', final: true },
          ],
          transitions: [
            { code: 'SUBMIT', from: 'DRAFT', to: 'SUBMITTED', actionCode: 'SUBMIT' },
            { code: 'APPROVE', from: 'SUBMITTED', to: 'APPROVED', actionCode: 'APPROVE' },
            { code: 'REJECT', from: 'SUBMITTED', to: 'REJECTED', actionCode: 'REJECT' },
          ],
          enabled: true,
        },
        processes: [
          {
            code: 'PR_SUBMIT_PROCESS',
            entityCode: 'PURCHASE_REQUEST',
            trigger: {
              actionCode: 'SUBMIT',
              workflowState: 'SUBMITTED',
            },
            steps: [
              { code: 'VALIDATE', type: 'VALIDATION', order: 1, enabled: true },
              {
                code: 'MULTI_LEVEL_APPROVAL',
                type: 'HUMAN_TASK',
                order: 2,
                enabled: true,
                config: {
                  title: 'Purchase Request Approval',
                  actionCode: 'APPROVE',
                  approvalMode: 'SEQUENTIAL',
                  amountField: 'amount',
                  slaHours: 24,
                  approvalLevels: [
                    { role: 'SUPERVISOR', minAmount: 0, label: 'Supervisor' },
                    { role: 'MANAGER', minAmount: 1000000, label: 'Manager' },
                    { role: 'SYSTEM_ADMIN', minAmount: 10000000, label: 'Director' },
                  ],
                },
              },
              {
                code: 'FINANCE_PARALLEL',
                type: 'HUMAN_TASK',
                order: 3,
                enabled: true,
                config: {
                  title: 'Finance Review',
                  actionCode: 'APPROVE',
                  approvalMode: 'PARALLEL',
                  condition: 'amount >= 5000000',
                  amountField: 'amount',
                  slaHours: 48,
                  approvalLevels: [
                    { role: 'MANAGER', minAmount: 5000000, label: 'Finance Manager' },
                    { role: 'SYSTEM_ADMIN', minAmount: 5000000, label: 'Finance Director' },
                  ],
                },
              },
              { code: 'NOTIFY_SUBMIT', type: 'EVENT', order: 4, enabled: true },
            ],
            enabled: true,
          },
        ],
        businesses: [
          {
            code: 'PR_VALIDATE',
            entityCode: 'PURCHASE_REQUEST',
            trigger: {
              processCode: 'PR_SUBMIT_PROCESS',
              stepCode: 'VALIDATE',
            },
            rules: [
              {
                code: 'REQUIRE_TITLE',
                type: 'VALIDATE_REQUIRED_FIELD',
                enabled: true,
                config: { field: 'title' },
              },
              {
                code: 'REQUIRE_AMOUNT',
                type: 'VALIDATE_REQUIRED_FIELD',
                enabled: true,
                config: { field: 'amount' },
              },
            ],
            enabled: true,
          },
        ],
        events: [
          {
            code: 'PR_SUBMITTED_EVENT',
            entityCode: 'PURCHASE_REQUEST',
            trigger: {
              actionCode: 'SUBMIT',
              workflowState: 'SUBMITTED',
              processCode: 'PR_SUBMIT_PROCESS',
            },
            handlers: [
              {
                code: 'NOTIFY_SUPERVISOR',
                type: 'NOTIFICATION',
                enabled: true,
                config: {
                  targetRole: 'SUPERVISOR',
                  message: 'New purchase request submitted',
                },
              },
            ],
            enabled: true,
          },
        ],
        views: [
          {
            code: 'PR_LIST',
            entityCode: 'PURCHASE_REQUEST',
            type: 'TABLE',
            columns: [
              { field: 'title', label: 'Title', visible: true, sortable: true, filterable: true },
              { field: 'amount', label: 'Amount', visible: true, sortable: true, filterable: false },
              { field: 'requester', label: 'Requester', visible: true, sortable: true, filterable: true },
              { field: 'status', label: 'Status', visible: true, sortable: true, filterable: true },
            ],
            filters: [{ field: 'status', operator: 'EQ' }],
            sorting: { field: 'title', direction: 'ASC' },
            enabled: true,
          },
        ],
      },
      {
        code: 'STOCK_BALANCE',
        name: 'Stock Balance',
        type: 'MASTER',
        fields: [
          { code: 'sku', required: true },
          { code: 'quantity', dataType: 'number' },
          { code: 'location' },
        ],
        actions: ['CREATE', 'READ', 'UPDATE'],
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
        themeCode: 'DEFAULT_THEME',
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
        themeCode: 'DEFAULT_THEME',
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
      {
        kind: 'PAGE',
        code: 'WORK_ORDER_MOBILE_PAGE',
        entityCode: 'WORK_ORDER',
        viewCode: 'WORK_ORDER_LIST',
        themeCode: 'COMPACT_THEME',
        template: 'MOBILE_STACK',
        regions: {
          HEADER: ['ACTION_BAR'],
          CONTENT: ['DETAIL_CARD'],
        },
        actions: ['START', 'COMPLETE', 'CANCEL'],
        relations: ['WORK_ORDER_ASSET_RELATION'],
        enabled: true,
      },
      {
        kind: 'PAGE',
        code: 'ASSET_MOBILE_PAGE',
        entityCode: 'ASSET',
        viewCode: 'ASSET_LOOKUP',
        themeCode: 'COMPACT_THEME',
        template: 'MOBILE_STACK',
        regions: {
          HEADER: ['ACTION_BAR'],
          CONTENT: ['DETAIL_CARD'],
        },
        actions: ['ACTIVATE', 'DISABLE'],
        relations: [],
        enabled: true,
      },
    ],
    experiences: [
      {
        code: 'WORK_ORDER_EXPERIENCE',
        entityCode: 'WORK_ORDER',
        enabled: true,
        priority: 100,
        variants: [
          {
            platform: 'WEB',
            pageCode: 'WORK_ORDER_DETAIL_PAGE',
            templateCode: 'MASTER_DETAIL',
            navigationCode: 'MAIN_NAVIGATION',
            themeCode: 'DEFAULT_THEME',
            layoutMode: 'DESKTOP_WORKSPACE',
            interaction: 'MOUSE_KEYBOARD',
          },
          {
            platform: 'MOBILE',
            pageCode: 'WORK_ORDER_MOBILE_PAGE',
            templateCode: 'MOBILE_STACK',
            navigationCode: 'MOBILE_NAV',
            themeCode: 'COMPACT_THEME',
            layoutMode: 'MOBILE_STACK',
            interaction: 'TOUCH',
          },
        ],
      },
      {
        code: 'ASSET_EXPERIENCE',
        entityCode: 'ASSET',
        enabled: true,
        priority: 100,
        variants: [
          {
            platform: 'WEB',
            pageCode: 'ASSET_DETAIL_PAGE',
            templateCode: 'MASTER_DETAIL',
            navigationCode: 'MAIN_NAVIGATION',
            themeCode: 'DEFAULT_THEME',
            layoutMode: 'DESKTOP_WORKSPACE',
            interaction: 'MOUSE_KEYBOARD',
          },
          {
            platform: 'MOBILE',
            pageCode: 'ASSET_MOBILE_PAGE',
            templateCode: 'MOBILE_STACK',
            navigationCode: 'MOBILE_NAV',
            themeCode: 'COMPACT_THEME',
            layoutMode: 'MOBILE_STACK',
            interaction: 'TOUCH',
          },
        ],
      },
    ],
    syncPolicies: [
      {
        code: 'WORK_ORDER_SYNC',
        entityCode: 'WORK_ORDER',
        enabled: true,
        offlineEnabled: true,
        strategy: 'OFFLINE_FIRST',
        syncDirection: 'BIDIRECTIONAL',
        conflictPolicy: 'MANUAL_REVIEW',
        retention: {
          maxAgeDays: 30,
          maxRecords: 500,
        },
        priority: 100,
      },
      {
        code: 'ASSET_SYNC',
        entityCode: 'ASSET',
        enabled: true,
        offlineEnabled: true,
        strategy: 'CACHE_ONLY',
        syncDirection: 'DOWNLOAD',
        conflictPolicy: 'SERVER_WINS',
        retention: {
          maxAgeDays: 90,
          maxRecords: 1000,
        },
        priority: 90,
      },
      {
        code: 'STOCK_BALANCE_SYNC',
        entityCode: 'STOCK_BALANCE',
        enabled: true,
        offlineEnabled: false,
        strategy: 'ONLINE_ONLY',
        syncDirection: 'DOWNLOAD',
        conflictPolicy: 'SERVER_WINS',
        priority: 10,
      },
    ],
    conflictPolicies: [
      {
        code: 'WORK_ORDER_CONFLICT_POLICY',
        entityCode: 'WORK_ORDER',
        enabled: true,
        strategy: 'MANUAL_REVIEW',
        rules: [
          {
            fieldCode: 'description',
            strategy: 'CLIENT_WINS',
          },
          {
            fieldCode: 'status',
            strategy: 'SERVER_WINS',
          },
        ],
      },
      {
        code: 'ASSET_CONFLICT_POLICY',
        entityCode: 'ASSET',
        enabled: true,
        strategy: 'SERVER_WINS',
        rules: [],
      },
    ],
    connectors: [
      {
        code: 'GENERIC_WEBHOOK',
        type: 'WEBHOOK',
        configSchema: {
          endpoint: 'https://example.invalid/redios-webhook',
          method: 'POST',
        },
        authType: 'NONE',
        enabled: true,
        version: 1,
      },
    ],
    integrations: [
      {
        code: 'SEND_NOTIFICATION_INTEGRATION',
        name: 'Send Notification Integration',
        enabled: true,
        version: 1,
        trigger: {
          type: 'EVENT',
          sourceCode: 'WORK_ORDER_STARTED_EVENT',
        },
        connector: {
          type: 'WEBHOOK',
          connectorCode: 'GENERIC_WEBHOOK',
        },
        mapping: {
          input: {
            'document.id': 'external.reference',
            'event.code': 'external.eventCode',
            'runtimeState.workflowState': 'external.state',
          },
          output: {},
        },
        errorPolicy: {
          retry: true,
          maxAttempts: 2,
          delayMs: 0,
          fallback: 'TRACE_ONLY',
        },
      },
    ],
    securityPolicies: [
      {
        code: 'WORK_ORDER_TECHNICIAN_POLICY',
        name: 'Work Order Technician Estimated Cost Policy',
        version: 1,
        target: {
          type: 'FIELD',
          entityCode: 'WORK_ORDER',
          code: 'estimatedCost',
        },
        effect: 'ALLOW',
        subjects: [{ type: 'ROLE', value: 'TECHNICIAN' }],
        rules: {
          read: true,
          visible: true,
          editable: false,
        },
        enabled: true,
      },
      {
        code: 'WORK_ORDER_TECHNICIAN_TITLE_POLICY',
        name: 'Work Order Technician Title Policy',
        version: 1,
        target: {
          type: 'FIELD',
          entityCode: 'WORK_ORDER',
          code: 'title',
        },
        effect: 'ALLOW',
        subjects: [{ type: 'ROLE', value: 'TECHNICIAN' }],
        rules: {
          read: true,
          visible: true,
          editable: true,
        },
        enabled: true,
      },
      {
        code: 'WORK_ORDER_ASSIGNEE_HIDDEN_POLICY',
        name: 'Work Order Assignee Hidden Policy',
        version: 1,
        target: {
          type: 'FIELD',
          entityCode: 'WORK_ORDER',
          code: 'assignedTo',
        },
        effect: 'DENY',
        subjects: [{ type: 'ROLE', value: 'COST_RESTRICTED' }],
        rules: {
          read: false,
          visible: false,
          editable: false,
        },
        enabled: true,
      },
      {
        code: 'WORK_ORDER_COST_HIDDEN_POLICY',
        name: 'Work Order Cost Hidden Policy',
        version: 1,
        target: {
          type: 'FIELD',
          entityCode: 'WORK_ORDER',
          code: 'estimatedCost',
        },
        effect: 'DENY',
        subjects: [{ type: 'ROLE', value: 'COST_RESTRICTED' }],
        rules: {
          read: false,
          visible: false,
          editable: false,
        },
        enabled: true,
      },
      {
        code: 'WORK_ORDER_DELETE_DENY_POLICY',
        name: 'Work Order Delete Deny Policy',
        version: 1,
        target: {
          type: 'ACTION',
          entityCode: 'WORK_ORDER',
          code: 'DELETE',
        },
        effect: 'DENY',
        subjects: [{ type: 'ROLE', value: 'TECHNICIAN' }],
        rules: {
          read: false,
          delete: false,
          visible: false,
        },
        enabled: true,
      },
      {
        code: 'WORK_ORDER_MENU_HIDDEN_POLICY',
        name: 'Work Order Menu Hidden Policy',
        version: 1,
        target: {
          type: 'UI',
          code: 'WORK_ORDER_DETAIL_PAGE',
        },
        effect: 'DENY',
        subjects: [{ type: 'ROLE', value: 'NO_WORK_ORDER' }],
        rules: {
          read: false,
          visible: false,
        },
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
        forms: [
          {
            code: 'TICKET_FORM',
            entityCode: 'TICKET',
            name: 'Ticket Form',
            version: 1,
            enabled: true,
            layout: {
              type: 'SECTION',
              sections: [
                {
                  code: 'GENERAL',
                  title: 'General',
                  order: 1,
                  fields: [
                    {
                      fieldCode: 'title',
                      component: 'TEXT_INPUT',
                      order: 1,
                      required: true,
                    },
                    {
                      fieldCode: 'priority',
                      component: 'SELECT',
                      order: 2,
                    },
                    {
                      fieldCode: 'assignee',
                      component: 'TEXT_INPUT',
                      order: 3,
                    },
                    {
                      fieldCode: 'status',
                      component: 'BADGE',
                      order: 4,
                      readonly: true,
                    },
                  ],
                },
              ],
            },
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
        themeCode: 'DEFAULT_THEME',
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
  ...[...commonThemeDefinitions, ...(application.themes ?? [])].map((theme) => createThemeRecord(application, theme)),
  ...[...commonNavigationDefinitions(application), ...(application.navigations ?? [])].map((navigation) =>
    createNavigationRecord(application, navigation),
  ),
  ...(application.securityPolicies ?? []).map((policy) => createSecurityPolicyRecord(application, policy)),
  ...(application.experiences ?? []).map((experience) => createExperienceRecord(application, experience)),
  ...(application.syncPolicies ?? []).map((syncPolicy) => createSyncPolicyRecord(application, syncPolicy)),
  ...(application.conflictPolicies ?? []).map((conflictPolicy) => createConflictPolicyRecord(application, conflictPolicy)),
  ...(application.connectors ?? []).map((connector) => createConnectorRecord(application, connector)),
  ...(application.integrations ?? []).map((integration) => createIntegrationRecord(application, integration)),
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
    ...(entity.forms ?? []).map((form) => createFormRecord(application, form)),
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

function createFormRecord(
  application: ApplicationSeed,
  form: FormDefinition,
): MetadataDefinition<FormDefinition> {
  return {
    tenantId,
    domainCode,
    applicationCode: application.code,
    type: 'FORM',
    code: form.code,
    name: form.name,
    version: form.version,
    enabled: form.enabled,
    definition: form,
  };
}

function createThemeRecord(
  application: ApplicationSeed,
  theme: ThemeDefinition,
): MetadataDefinition<ThemeDefinition> {
  return {
    tenantId,
    domainCode,
    applicationCode: application.code,
    type: 'THEME',
    code: theme.code,
    name: theme.name,
    version: theme.version,
    enabled: theme.enabled,
    definition: theme,
  };
}

function createNavigationRecord(
  application: ApplicationSeed,
  navigation: NavigationDefinition,
): MetadataDefinition<NavigationDefinition> {
  return {
    tenantId,
    domainCode,
    applicationCode: application.code,
    type: 'NAVIGATION',
    code: navigation.code,
    name: navigation.name,
    version: 1,
    enabled: navigation.enabled,
    definition: navigation,
  };
}

function createSecurityPolicyRecord(
  application: ApplicationSeed,
  policy: SecurityPolicyDefinition,
): MetadataDefinition<SecurityPolicyDefinition> {
  return {
    tenantId,
    domainCode,
    applicationCode: application.code,
    type: 'SECURITY_POLICY',
    code: policy.code,
    name: policy.name,
    version: policy.version,
    enabled: policy.enabled,
    definition: policy,
  };
}

function createExperienceRecord(
  application: ApplicationSeed,
  experience: ExperienceDefinition,
): MetadataDefinition<ExperienceDefinition> {
  return {
    tenantId,
    domainCode,
    applicationCode: application.code,
    type: 'EXPERIENCE',
    code: experience.code,
    name: toLabel(experience.code),
    version: 1,
    enabled: experience.enabled,
    definition: experience,
  };
}

function createSyncPolicyRecord(
  application: ApplicationSeed,
  syncPolicy: SyncDefinition,
): MetadataDefinition<SyncDefinition> {
  return {
    tenantId,
    domainCode,
    applicationCode: application.code,
    type: 'SYNC_POLICY',
    code: syncPolicy.code,
    name: toLabel(syncPolicy.code),
    version: 1,
    enabled: syncPolicy.enabled,
    definition: syncPolicy,
  };
}

function createConflictPolicyRecord(
  application: ApplicationSeed,
  conflictPolicy: ConflictPolicyDefinition,
): MetadataDefinition<ConflictPolicyDefinition> {
  return {
    tenantId,
    domainCode,
    applicationCode: application.code,
    type: 'CONFLICT_POLICY',
    code: conflictPolicy.code,
    name: toLabel(conflictPolicy.code),
    version: 1,
    enabled: conflictPolicy.enabled,
    definition: conflictPolicy,
  };
}

function createConnectorRecord(
  application: ApplicationSeed,
  connector: ConnectorDefinition,
): MetadataDefinition<ConnectorDefinition> {
  return {
    tenantId,
    domainCode,
    applicationCode: application.code,
    type: 'CONNECTOR',
    code: connector.code,
    name: toLabel(connector.code),
    version: connector.version,
    enabled: connector.enabled,
    definition: connector,
  };
}

function createIntegrationRecord(
  application: ApplicationSeed,
  integration: IntegrationDefinition,
): MetadataDefinition<IntegrationDefinition> {
  return {
    tenantId,
    domainCode,
    applicationCode: application.code,
    type: 'INTEGRATION',
    code: integration.code,
    name: integration.name,
    version: integration.version,
    enabled: integration.enabled,
    definition: integration,
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
  if (['TEXT_INPUT', 'TEXT_AREA', 'NUMBER_INPUT', 'DATE_PICKER', 'SELECT', 'LOOKUP'].includes(code)) {
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
  if (['TEXT_INPUT', 'TEXT_AREA', 'NUMBER_INPUT', 'DATE_PICKER', 'SELECT', 'LOOKUP'].includes(code)) {
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
