import type { BuilderComponentDefinition } from '../builder/types';

export interface StudioDataAttribute {
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'lookup';
}

export interface StudioDataObject {
  name: string;
  attributes: StudioDataAttribute[];
}

export interface StudioActionDraft {
  code: string;
  label: string;
  trigger: string;
  steps: string[];
}

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

const DATA_OBJECTS_KEY = 'redios:studio:metadata:data-objects';
const ACTIONS_KEY = 'redios:studio:metadata:actions';
const CUSTOM_APIS_KEY = 'redios:studio:metadata:custom-apis';
const CUSTOM_ORGANISMS_KEY = 'redios:studio:metadata:custom-organisms';

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
    trigger: 'Button click',
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

export function loadDataObjects() {
  return readStoredValue(DATA_OBJECTS_KEY, defaultDataObjects);
}

export function saveDataObjects(value: StudioDataObject[]) {
  writeStoredValue(DATA_OBJECTS_KEY, value);
}

export function loadActions() {
  return readStoredValue(ACTIONS_KEY, defaultActions);
}

export function saveActions(value: StudioActionDraft[]) {
  writeStoredValue(ACTIONS_KEY, value);
}

export function loadCustomApis() {
  return readStoredValue(CUSTOM_APIS_KEY, defaultCustomApis);
}

export function saveCustomApis(value: StudioCustomApiDraft[]) {
  writeStoredValue(CUSTOM_APIS_KEY, value);
}

export function loadCustomOrganisms() {
  return readStoredValue(CUSTOM_ORGANISMS_KEY, defaultCustomOrganisms);
}

export function saveCustomOrganisms(value: StudioCustomOrganismDraft[]) {
  writeStoredValue(CUSTOM_ORGANISMS_KEY, value);
}

export function customOrganismsAsComponents(): BuilderComponentDefinition[] {
  return loadCustomOrganisms().map((organism) => ({
    type: organism.type,
    label: organism.label,
    layer: 'ORGANISM',
    description: organism.components.join(' + '),
  }));
}

export function findCustomOrganism(type: string) {
  return loadCustomOrganisms().find((organism) => organism.type === type);
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
