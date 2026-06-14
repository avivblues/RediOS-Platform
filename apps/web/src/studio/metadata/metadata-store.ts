import type { BuilderComponentDefinition, CanvasComponent, StudioTarget } from '../builder/types';

export interface StudioDataAttribute {
  name: string;
  type:
    | 'text'
    | 'longText'
    | 'number'
    | 'integer'
    | 'decimal'
    | 'double'
    | 'currency'
    | 'percentage'
    | 'date'
    | 'time'
    | 'datetime'
    | 'boolean'
    | 'email'
    | 'phone'
    | 'url'
    | 'lookup'
    | 'json'
    | 'file'
    | 'image';
}

export interface StudioDataObject {
  name: string;
  attributes: StudioDataAttribute[];
}

export interface StudioActionDraft {
  code: string;
  label: string;
  trigger: StudioActionTrigger;
  steps: string[];
}

export type StudioActionTrigger = 'onClick' | 'onChange' | 'onSubmit' | 'onFocus' | 'onBlur' | 'onLoad' | 'process';

export interface StudioCustomApiDraft {
  code: string;
  label: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  auth: 'None' | 'API Key' | 'Bearer Token';
  mappedAction?: string;
}

export interface StudioCustomOrganismDraft {
  type: string;
  label: string;
  description: string;
  components: string[];
}

export interface StudioProcessDraft {
  code: string;
  label: string;
  description: string;
  steps: Array<{
    id: string;
    label: string;
    approver: string;
    condition?: string;
    delegation?: string;
  }>;
}

export interface StudioMenuDraft {
  id: string;
  label: string;
  route: string;
  screen: string;
  permission: string;
  parent?: string;
}

export interface StudioScreenDraft {
  code: string;
  label: string;
  objectName?: string;
  mode: 'create' | 'edit' | 'detail' | 'list';
  target: StudioTarget;
  updatedAt: string;
}

export interface StudioSecurityDraft {
  roles: Array<{
    code: string;
    label: string;
    permissions: string[];
    fieldAccess: Record<string, 'hidden' | 'read' | 'write'>;
    actionAccess: string[];
    powerUser?: boolean;
  }>;
}

export interface StudioThemeDraft {
  name: string;
  tokens: Record<string, string>;
}

export interface StudioApplicationMetadataPackage {
  appCode: string;
  appSlug: string;
  appName: string;
  target: StudioTarget;
  dataObjects: StudioDataObject[];
  actions: StudioActionDraft[];
  connectors: StudioCustomApiDraft[];
  processes: StudioProcessDraft[];
  menu: StudioMenuDraft[];
  screens: StudioScreenDraft[];
  security: StudioSecurityDraft;
  customOrganisms: StudioCustomOrganismDraft[];
  canvas: CanvasComponent[];
  screenCanvases: Record<string, CanvasComponent[]>;
  theme: StudioThemeDraft;
  publishedAt: string;
}

export interface StudioApplicationDraft {
  code: string;
  name: string;
  slug: string;
  template: string;
  target: StudioTarget;
  createdAt: string;
}

const DATA_OBJECTS_KEY = 'redios:studio:metadata:data-objects';
const ACTIONS_KEY = 'redios:studio:metadata:actions';
const CUSTOM_APIS_KEY = 'redios:studio:metadata:custom-apis';
const CUSTOM_ORGANISMS_KEY = 'redios:studio:metadata:custom-organisms';
const PROCESSES_KEY = 'redios:studio:metadata:processes';
const MENU_KEY = 'redios:studio:metadata:menu';
const SCREENS_KEY = 'redios:studio:metadata:screens';
const SECURITY_KEY = 'redios:studio:metadata:security';
const APPLICATIONS_KEY = 'redios:studio:applications';
const ACTIVE_APP_KEY_PREFIX = 'redios:studio:active-app';
const PUBLISHED_APP_KEY_PREFIX = 'redios:studio:published-app';

export const defaultDataObjects: StudioDataObject[] = [
  {
    name: 'Product',
    attributes: [
      { name: 'name', type: 'text' },
      { name: 'stock', type: 'number' },
      { name: 'price', type: 'number' },
    ],
  },
  {
    name: 'Customer',
    attributes: [
      { name: 'name', type: 'text' },
      { name: 'phone', type: 'text' },
    ],
  },
];

export const defaultActions: StudioActionDraft[] = [
  {
    code: 'SAVE_PRODUCT',
    label: 'Save Product',
    trigger: 'onClick',
    steps: ['validate', 'save', 'notify'],
  },
];

export const defaultCustomApis: StudioCustomApiDraft[] = [
  {
    code: 'SYNC_PRODUCT_TO_ERP',
    label: 'Sync Product to ERP',
    method: 'POST',
    url: 'https://partner.example.com/products',
    auth: 'Bearer Token',
    mappedAction: 'SAVE_PRODUCT',
  },
];

export const defaultCustomOrganisms: StudioCustomOrganismDraft[] = [
  {
    type: 'CustomInventoryHeader',
    label: 'Inventory Header',
    description: 'Reusable header with search, stock summary, and quick action.',
    components: ['Search', 'Button', 'Dashboard'],
  },
];

export const defaultProcesses: StudioProcessDraft[] = [
  {
    code: 'PRODUCT_APPROVAL',
    label: 'Product Approval',
    description: 'Optional approval process for product changes.',
    steps: [
      { id: 'submit', label: 'Submit', approver: 'Requester' },
      { id: 'supervisor_approval', label: 'Supervisor Approval', approver: 'Supervisor', condition: 'stock > 100' },
      { id: 'done', label: 'Done', approver: 'System' },
    ],
  },
];

export const defaultMenu: StudioMenuDraft[] = [
  {
    id: 'inventory',
    label: 'Inventory',
    route: '/inventory',
    screen: 'inventory-root',
    permission: 'inventory.view',
  },
  {
    id: 'inventory-product',
    label: 'Product',
    route: '/product',
    screen: 'product-screen',
    permission: 'product.view',
    parent: 'inventory',
  },
];

export const defaultScreens: StudioScreenDraft[] = [
  {
    code: 'product-screen',
    label: 'Product Form',
    objectName: 'Product',
    mode: 'create',
    target: 'web',
    updatedAt: new Date().toISOString(),
  },
];

export const defaultSecurity: StudioSecurityDraft = {
  roles: [
    {
      code: 'ADMIN',
      label: 'Admin',
      permissions: ['*'],
      fieldAccess: {},
      actionAccess: ['*'],
    },
    {
      code: 'POWER_USER',
      label: 'Power User',
      permissions: ['product.view', 'product.create', 'layout.customize', 'automation.create', 'approval.create', 'report.create'],
      fieldAccess: {},
      actionAccess: ['SAVE_PRODUCT'],
      powerUser: true,
    },
    {
      code: 'USER',
      label: 'User',
      permissions: ['product.view', 'product.create'],
      fieldAccess: {},
      actionAccess: ['SAVE_PRODUCT'],
    },
  ],
};

export function loadDataObjects(appCode?: string) {
  return readStoredValue(scopedMetadataKey(DATA_OBJECTS_KEY, appCode), readStoredValue(DATA_OBJECTS_KEY, defaultDataObjects));
}

export function saveDataObjects(value: StudioDataObject[], appCode?: string) {
  writeStoredValue(scopedMetadataKey(DATA_OBJECTS_KEY, appCode), value);
}

export function loadActions(appCode?: string) {
  return readStoredValue(scopedMetadataKey(ACTIONS_KEY, appCode), readStoredValue(ACTIONS_KEY, defaultActions));
}

export function saveActions(value: StudioActionDraft[], appCode?: string) {
  writeStoredValue(scopedMetadataKey(ACTIONS_KEY, appCode), value);
}

export function loadCustomApis(appCode?: string) {
  return readStoredValue(scopedMetadataKey(CUSTOM_APIS_KEY, appCode), readStoredValue(CUSTOM_APIS_KEY, defaultCustomApis));
}

export function saveCustomApis(value: StudioCustomApiDraft[], appCode?: string) {
  writeStoredValue(scopedMetadataKey(CUSTOM_APIS_KEY, appCode), value);
}

export function loadCustomOrganisms(appCode?: string) {
  return readStoredValue(scopedMetadataKey(CUSTOM_ORGANISMS_KEY, appCode), readStoredValue(CUSTOM_ORGANISMS_KEY, defaultCustomOrganisms));
}

export function saveCustomOrganisms(value: StudioCustomOrganismDraft[], appCode?: string) {
  writeStoredValue(scopedMetadataKey(CUSTOM_ORGANISMS_KEY, appCode), value);
}

export function loadProcesses(appCode?: string) {
  return readStoredValue(scopedMetadataKey(PROCESSES_KEY, appCode), defaultProcesses);
}

export function saveProcesses(value: StudioProcessDraft[], appCode?: string) {
  writeStoredValue(scopedMetadataKey(PROCESSES_KEY, appCode), value);
}

export function loadMenu(appCode?: string) {
  return readStoredValue(scopedMetadataKey(MENU_KEY, appCode), defaultMenu);
}

export function saveMenu(value: StudioMenuDraft[], appCode?: string) {
  writeStoredValue(scopedMetadataKey(MENU_KEY, appCode), value);
}

export function loadScreens(appCode?: string) {
  return readStoredValue(scopedMetadataKey(SCREENS_KEY, appCode), defaultScreens);
}

export function saveScreens(value: StudioScreenDraft[], appCode?: string) {
  writeStoredValue(scopedMetadataKey(SCREENS_KEY, appCode), value);
}

export function loadSecurity(appCode?: string) {
  return readStoredValue(scopedMetadataKey(SECURITY_KEY, appCode), defaultSecurity);
}

export function saveSecurity(value: StudioSecurityDraft, appCode?: string) {
  writeStoredValue(scopedMetadataKey(SECURITY_KEY, appCode), value);
}

export function customOrganismsAsComponents(appCode?: string): BuilderComponentDefinition[] {
  return loadCustomOrganisms(appCode).map((organism) => ({
    type: organism.type,
    label: organism.label,
    layer: 'ORGANISM',
    description: organism.components.join(' + '),
  }));
}

export function findCustomOrganism(type: string, appCode?: string) {
  return loadCustomOrganisms(appCode).find((organism) => organism.type === type);
}

export function resolveActiveApplicationCode(target?: StudioTarget) {
  if (target) {
    const code = window.localStorage.getItem(`${ACTIVE_APP_KEY_PREFIX}:${target}`);

    if (code) {
      return code;
    }
  }

  return window.localStorage.getItem(`${ACTIVE_APP_KEY_PREFIX}:web`)
    ?? window.localStorage.getItem(`${ACTIVE_APP_KEY_PREFIX}:android`)
    ?? 'INVENTORY';
}

export function setActiveApplicationCode(target: StudioTarget, appCode: string) {
  window.localStorage.setItem(`${ACTIVE_APP_KEY_PREFIX}:${target}`, appCode);
}

export function loadStudioApplications(): StudioApplicationDraft[] {
  const applications = readStoredValue<StudioApplicationDraft[]>(APPLICATIONS_KEY, []);

  if (applications.length > 0) {
    return applications;
  }

  return [
    {
      code: resolveActiveApplicationCode('web'),
      name: 'Inventory',
      slug: 'inventory',
      template: 'INVENTORY_EXPERIENCE',
      target: 'web',
      createdAt: new Date().toISOString(),
    },
  ];
}

export function toApplicationSlug(value: string) {
  const slug = value
    .trim()
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

  return slug || 'new-application';
}

export function publishApplicationPackage(packageValue: StudioApplicationMetadataPackage) {
  writeStoredValue(`${PUBLISHED_APP_KEY_PREFIX}:${packageValue.appSlug}`, packageValue);
}

export function loadPublishedApplication(appSlug: string) {
  return readStoredValue<StudioApplicationMetadataPackage | undefined>(`${PUBLISHED_APP_KEY_PREFIX}:${appSlug}`, undefined);
}

export function seedApplicationMetadata(appCode: string, template: string) {
  if (template === 'BLANK_EXPERIENCE') {
    writeStoredValue(scopedMetadataKey(DATA_OBJECTS_KEY, appCode), []);
    writeStoredValue(scopedMetadataKey(ACTIONS_KEY, appCode), []);
    writeStoredValue(scopedMetadataKey(CUSTOM_APIS_KEY, appCode), []);
    writeStoredValue(scopedMetadataKey(CUSTOM_ORGANISMS_KEY, appCode), []);
    writeStoredValue(scopedMetadataKey(PROCESSES_KEY, appCode), []);
    writeStoredValue(scopedMetadataKey(MENU_KEY, appCode), []);
    writeStoredValue(scopedMetadataKey(SCREENS_KEY, appCode), []);
    writeStoredValue(scopedMetadataKey(SECURITY_KEY, appCode), defaultSecurity);
    return;
  }

  writeStoredValue(scopedMetadataKey(DATA_OBJECTS_KEY, appCode), defaultDataObjects);
  writeStoredValue(scopedMetadataKey(ACTIONS_KEY, appCode), defaultActions);
  writeStoredValue(scopedMetadataKey(CUSTOM_APIS_KEY, appCode), defaultCustomApis);
  writeStoredValue(scopedMetadataKey(CUSTOM_ORGANISMS_KEY, appCode), defaultCustomOrganisms);
  writeStoredValue(scopedMetadataKey(PROCESSES_KEY, appCode), defaultProcesses);
  writeStoredValue(scopedMetadataKey(MENU_KEY, appCode), defaultMenu);
  writeStoredValue(scopedMetadataKey(SCREENS_KEY, appCode), defaultScreens);
  writeStoredValue(scopedMetadataKey(SECURITY_KEY, appCode), defaultSecurity);
}

export function toMetadataCode(value: string) {
  const normalized = value
    .trim()
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase();

  return normalized || `CUSTOM_${Date.now()}`;
}

export function toComponentType(value: string) {
  const words = value.trim().replace(/[^a-zA-Z0-9]+/g, ' ').split(' ').filter(Boolean);
  const type = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join('');

  return type ? `Custom${type}` : `CustomOrganism${Date.now()}`;
}

function scopedMetadataKey(key: string, appCode = resolveActiveApplicationCode()) {
  return `redios:studio:apps:${appCode}:${key}`;
}

function readStoredValue<T>(key: string, fallback: T): T {
  try {
    const rawValue = window.localStorage.getItem(key);

    if (!rawValue) {
      return fallback;
    }

    return JSON.parse(rawValue) as T;
  } catch {
    return fallback;
  }
}

function writeStoredValue<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value));
}
