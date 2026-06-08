import type { CreationEntityInput, CreationFieldInput } from '../create/creation-types';

export type ScreenComponentType = 'Text Input' | 'Number' | 'Date' | 'Dropdown' | 'Table' | 'Button' | 'Section' | 'Tabs';
export type PreviewDevice = 'Desktop' | 'Tablet' | 'Mobile';

export interface DesignedScreenField extends CreationFieldInput {
  id: string;
  width: 'Full' | 'Half' | 'Third';
  visible: boolean;
  readonly: boolean;
}

export interface DesignedScreenSection {
  id: string;
  title: string;
  columns: number;
  fields: DesignedScreenField[];
}

export interface DesignedScreenLayout {
  screen: string;
  entityName: string;
  sections: DesignedScreenSection[];
}

export function createInitialScreenLayout(entity?: CreationEntityInput): DesignedScreenLayout {
  const entityName = entity?.name || 'Product';
  const fields = entity?.fields ?? [];

  return {
    screen: `${entityName} Screen`,
    entityName,
    sections: [
      {
        id: 'basic',
        title: 'Basic Info',
        columns: 2,
        fields: fields.map((field, index) => toDesignedField(field, index)),
      },
    ],
  };
}

export function toDesignedField(field: CreationFieldInput, index: number): DesignedScreenField {
  return {
    ...field,
    id: `${field.label}:${index}`,
    width: field.type === 'Long Text' ? 'Full' : 'Half',
    visible: true,
    readonly: false,
  };
}

export function autoDesignLayout(entity?: CreationEntityInput): DesignedScreenLayout {
  const entityName = entity?.name || 'Product';
  const fields = (entity?.fields ?? []).map((field, index) => toDesignedField(field, index));
  const nameFields = fields.filter((field) => /name|title|code|sku/i.test(field.label));
  const descriptionFields = fields.filter((field) => /description|notes|detail/i.test(field.label) || field.type === 'Long Text');
  const numberFields = fields.filter((field) => field.type === 'Number' || field.type === 'Money' || /price|stock|qty|quantity/i.test(field.label));
  const dateFields = fields.filter((field) => field.type === 'Date' || field.type === 'Date Time' || /date|time/i.test(field.label));
  const statusFields = fields.filter((field) => /status|state|priority/i.test(field.label));
  const used = new Set([...nameFields, ...descriptionFields, ...numberFields, ...dateFields, ...statusFields].map((field) => field.id));
  const otherFields = fields.filter((field) => !used.has(field.id));

  return {
    screen: `${entityName} Screen`,
    entityName,
    sections: [
      section('basic', 'Basic Info', 2, [...nameFields, ...descriptionFields.map((field) => ({ ...field, width: 'Full' as const }))]),
      section('inventory', 'Inventory', 2, numberFields),
      section('schedule', 'Dates', 2, dateFields),
      section('status', 'Status', 2, statusFields.map((field) => ({ ...field, width: 'Half' as const }))),
      section('more', 'Additional Information', 2, otherFields),
    ].filter((candidate) => candidate.fields.length > 0),
  };
}

function section(id: string, title: string, columns: number, fields: DesignedScreenField[]): DesignedScreenSection {
  return {
    id,
    title,
    columns,
    fields,
  };
}
