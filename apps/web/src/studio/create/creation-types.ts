import type {
  ApplicationDefinition,
  EntityDefinition,
  FieldDefinition,
  FormDefinition,
  MetadataDefinition,
  NavigationDefinition,
  RelationDefinition,
  ThemeDefinition,
  UIDefinition,
  ViewDefinition,
} from '@redios/shared';

export type CreationFieldType =
  | 'Text'
  | 'Long Text'
  | 'Number'
  | 'Money'
  | 'Date'
  | 'Date Time'
  | 'Boolean'
  | 'Lookup'
  | 'Attachment'
  | 'User';

export interface CreationFieldInput {
  label: string;
  type: CreationFieldType;
  required: boolean;
  unique: boolean;
  searchable?: boolean;
  showInList?: boolean;
  defaultValue?: string;
  helpText?: string;
  relatedObject?: string;
  displayField?: string;
}

export interface CreationEntityInput {
  name: string;
  description?: string;
  fields: CreationFieldInput[];
}

export interface CreationScreenLayout {
  screen: string;
  entityName: string;
  sections: Array<{
    title: string;
    columns: number;
    fields: Array<{
      label: string;
      sourceLabel?: string;
      required?: boolean;
      readonly?: boolean;
      visible?: boolean;
      width?: string;
      showInList?: boolean;
      searchable?: boolean;
    }>;
  }>;
}

export interface CreationDraft {
  application: {
    name: string;
    description?: string;
    icon?: string;
    startFrom: 'Blank' | 'Template';
  };
  entities: CreationEntityInput[];
  fields: Record<string, CreationFieldInput[]>;
  forms: string[];
  views: string[];
  navigation: string[];
  screenLayouts: Record<string, CreationScreenLayout>;
  generated: GeneratedMetadataSet;
}

export interface GeneratedMetadataSet {
  application?: MetadataDefinition<ApplicationDefinition>;
  entities: Array<MetadataDefinition<EntityDefinition>>;
  fields: Array<MetadataDefinition<FieldDefinition>>;
  relations: Array<MetadataDefinition<RelationDefinition>>;
  forms: Array<MetadataDefinition<FormDefinition>>;
  views: Array<MetadataDefinition<ViewDefinition>>;
  pages: Array<MetadataDefinition<UIDefinition>>;
  themes: Array<MetadataDefinition<ThemeDefinition>>;
  navigation?: MetadataDefinition<NavigationDefinition>;
}

export function emptyGeneratedMetadata(): GeneratedMetadataSet {
  return {
    entities: [],
    fields: [],
    relations: [],
    forms: [],
    views: [],
    pages: [],
    themes: [],
  };
}

export function createInitialCreationDraft(): CreationDraft {
  return {
    application: {
      name: '',
      description: '',
      icon: 'box',
      startFrom: 'Blank',
    },
    entities: [],
    fields: {},
    forms: [],
    views: [],
    navigation: [],
    screenLayouts: {},
    generated: emptyGeneratedMetadata(),
  };
}
