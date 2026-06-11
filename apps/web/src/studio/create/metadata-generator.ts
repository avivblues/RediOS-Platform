import type {
  ApplicationDefinition,
  EntityDefinition,
  FieldDataType,
  FieldDefinition,
  FormDefinition,
  FormFieldDefinition,
  MetadataDefinition,
  MetadataType,
  NavigationDefinition,
  RelationDefinition,
  ThemeDefinition,
  UIDefinition,
  UIAtomDefinition,
  UIMoleculeDefinition,
  UIOrganismDefinition,
  UIPageDefinition,
  UITemplateDefinition,
  ViewDefinition,
} from '@redios/shared';
import type { CreationDraft, CreationEntityInput, CreationFieldInput, GeneratedMetadataSet } from './creation-types';

interface GeneratorContext {
  tenantId: string;
  domainCode: string;
  applicationCode: string;
}

export function generateApplication(input: CreationDraft['application'], context: GeneratorContext): MetadataDefinition<ApplicationDefinition> {
  const code = codeFromLabel(input.name);
  const entityCodes: string[] = [];

  return metadata('APPLICATION', code, input.name, context, {
    code,
    name: input.name,
    description: input.description,
    capabilities: ['DATA', 'FORM', 'VIEW', 'PAGE', 'NAVIGATION'],
    entityCodes,
    enabled: true,
  });
}

export function generateEntity(input: CreationEntityInput, context: GeneratorContext): MetadataDefinition<EntityDefinition> {
  const code = codeFromLabel(input.name);

  return metadata('ENTITY', code, input.name, context, {
    code,
    name: input.name,
    type: 'MASTER',
    fieldCodes: input.fields.map((field) => fieldCodeFromLabel(field.label)),
    actionCodes: [],
    enabled: true,
  });
}

export function generateField(entityCode: string, input: CreationFieldInput, context: GeneratorContext): MetadataDefinition<FieldDefinition> {
  const code = fieldCodeFromLabel(input.label);
  const dataType = fieldDataType(input.type);

  return metadata('FIELD', code, input.label, context, {
    code,
    name: input.label,
    entityCode,
    dataType,
    required: input.required,
    defaultValue: input.defaultValue || undefined,
    visible: true,
    readonly: false,
    validation: {
      unique: input.unique,
      helpText: input.helpText,
      searchable: input.searchable,
      showInList: input.showInList,
    },
    relation: input.type === 'Lookup' && input.relatedObject ? `${entityCode}_${codeFromLabel(input.relatedObject)}_RELATION` : undefined,
  });
}

export function generateRelation(entityCode: string, field: CreationFieldInput, context: GeneratorContext): MetadataDefinition<RelationDefinition> | undefined {
  if (field.type !== 'Lookup' || !field.relatedObject) {
    return undefined;
  }

  const targetEntity = codeFromLabel(field.relatedObject);
  const fieldCode = fieldCodeFromLabel(field.label);
  const code = `${entityCode}_${targetEntity}_RELATION`;

  return metadata('RELATION', code, `${entityCode} ${targetEntity} Relation`, context, {
    code,
    source: {
      entityCode,
    },
    target: {
      entityCode: targetEntity,
    },
    type: 'MANY_TO_ONE',
    mapping: {
      sourceField: fieldCode,
      targetField: field.displayField ? fieldCodeFromLabel(field.displayField) : 'id',
    },
    behavior: {
      required: field.required,
      cascade: false,
      ownership: false,
      lookup: true,
    },
    enabled: true,
  });
}

export function generateForm(entity: CreationEntityInput, context: GeneratorContext, draft?: CreationDraft): MetadataDefinition<FormDefinition> {
  const entityCode = codeFromLabel(entity.name);
  const code = `${entityCode}_FORM`;
  const layout = draft?.screenLayouts[entity.name];
  const sections = layout?.sections.length
    ? layout.sections.map((section, sectionIndex) => ({
        code: codeFromLabel(section.title) || `SECTION_${sectionIndex + 1}`,
        title: section.title,
        order: sectionIndex + 1,
        fields: section.fields.filter((field) => !field.designerOnly).map<FormFieldDefinition>((field, index) => {
          const sourceField = entity.fields.find((candidate) => candidate.label === (field.sourceLabel ?? field.label)) ?? entity.fields[index];
          return {
            fieldCode: fieldCodeFromLabel(field.sourceLabel ?? field.label),
            component: sourceField ? componentForField(sourceField) : 'TEXT_INPUT',
            order: index + 1,
            required: field.required ?? sourceField?.required ?? false,
            readonly: field.readonly ?? false,
            visible: field.visible ?? true,
            validation: {
              width: field.width,
              showInList: field.showInList,
              searchable: field.searchable,
            },
            lookup: sourceField?.type === 'Lookup' && sourceField.relatedObject
              ? {
                  relationCode: `${entityCode}_${codeFromLabel(sourceField.relatedObject)}_RELATION`,
                  viewCode: `${codeFromLabel(sourceField.relatedObject)}_LIST`,
                }
              : undefined,
          };
        }),
      }))
    : [
        {
          code: 'GENERAL',
          title: `${entity.name} Details`,
          order: 1,
          fields: entity.fields.map<FormFieldDefinition>((field, index) => ({
            fieldCode: fieldCodeFromLabel(field.label),
            component: componentForField(field),
            order: index + 1,
            required: field.required,
            readonly: false,
            visible: true,
            validation: {
              showInList: field.showInList,
            },
            lookup: field.type === 'Lookup' && field.relatedObject
              ? {
                  relationCode: `${entityCode}_${codeFromLabel(field.relatedObject)}_RELATION`,
                  viewCode: `${codeFromLabel(field.relatedObject)}_LIST`,
                }
              : undefined,
          })),
        },
      ];

  return metadata('FORM', code, `${entity.name} Form`, context, {
    code,
    entityCode,
    name: `${entity.name} Form`,
    version: 1,
    enabled: true,
    layout: {
      type: 'SECTION',
      sections,
    },
  });
}

export function generateView(entity: CreationEntityInput, context: GeneratorContext, draft?: CreationDraft): MetadataDefinition<ViewDefinition> {
  const entityCode = codeFromLabel(entity.name);
  const code = `${entityCode}_LIST`;
  const layoutFields = draft?.screenLayouts[entity.name]?.sections.flatMap((section) => section.fields).filter((field) => !field.designerOnly) ?? [];

  return metadata('VIEW', code, `${entity.name} List`, context, {
    code,
    entityCode,
    type: 'TABLE',
    columns: entity.fields
      .map((field) => {
        const screenField = layoutFields.find((candidate) => (candidate.sourceLabel ?? candidate.label) === field.label);

        return {
          field,
          screenField,
          showInList: screenField?.showInList ?? field.showInList,
        };
      })
      .filter(({ showInList }) => showInList !== false)
      .slice(0, 6)
      .map(({ field, screenField }) => ({
        field: fieldCodeFromLabel(field.label),
        label: screenField?.label ?? field.label,
        visible: true,
        sortable: field.type !== 'Long Text',
        filterable: (screenField?.searchable ?? field.searchable) !== false,
      })),
    filters: [],
    enabled: true,
  });
}

export function generatePage(entity: CreationEntityInput, context: GeneratorContext): MetadataDefinition<UIDefinition> {
  const entityCode = codeFromLabel(entity.name);
  const page: UIPageDefinition = {
    kind: 'PAGE',
    code: `${entityCode}_DETAIL_PAGE`,
    entityCode,
    viewCode: `${entityCode}_LIST`,
    template: `${entityCode}_FORM_WORKSPACE_TEMPLATE`,
    regions: {
      main: [`${entityCode}_SCREEN_COMPOSITION`],
    },
    actions: [],
    enabled: true,
  };

  return metadata('UI', page.code, `${entity.name} Page`, context, page);
}

export function generateNavigation(draft: CreationDraft, context: GeneratorContext): MetadataDefinition<NavigationDefinition> {
  const appCode = codeFromLabel(draft.application.name);
  const code = `${appCode}_NAVIGATION`;

  return metadata('NAVIGATION', code, `${draft.application.name} Navigation`, context, {
    code,
    name: `${draft.application.name} Navigation`,
    type: 'SIDEBAR',
    enabled: true,
    items: draft.entities.map((entity, index) => {
      const entityCode = codeFromLabel(entity.name);

      return {
        code: `${entityCode}_MENU`,
        label: entity.name,
        icon: 'box',
        order: index + 1,
        target: {
          type: 'PAGE',
          code: `${entityCode}_DETAIL_PAGE`,
        },
        children: [],
      };
    }),
  });
}

export function generateTheme(context: GeneratorContext): MetadataDefinition<ThemeDefinition> {
  return metadata('THEME', 'DEFAULT_THEME', 'Default Theme', context, {
    code: 'DEFAULT_THEME',
    name: 'Default Theme',
    version: 1,
    enabled: true,
    tokens: {
      colors: {
        primary: '#2563eb',
        secondary: '#64748b',
        success: '#16a34a',
        warning: '#f59e0b',
        danger: '#dc2626',
        background: '#f8fafc',
        surface: '#ffffff',
        text: '#0f172a',
      },
      typography: {
        fontFamily: 'Inter, system-ui, sans-serif',
        size: {
          small: '0.875rem',
          medium: '1rem',
          large: '1.25rem',
          title: '1.75rem',
        },
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
      },
      radius: {
        small: '0.375rem',
        medium: '0.75rem',
        large: '1rem',
      },
    },
    layout: {
      navigation: 'SIDEBAR',
      density: 'COMFORTABLE',
    },
    assets: {},
  });
}

export function generateMetadataSet(draft: CreationDraft, context: GeneratorContext): GeneratedMetadataSet {
  const application = generateApplication(draft.application, context);
  const entities = draft.entities.map((entity) => generateEntity(entity, context));
  const fields = draft.entities.flatMap((entity) => {
    const entityCode = codeFromLabel(entity.name);
    return entity.fields.map((field) => generateField(entityCode, field, context));
  });
  const relations = draft.entities.flatMap((entity) => {
    const entityCode = codeFromLabel(entity.name);
    return entity.fields.map((field) => generateRelation(entityCode, field, context)).filter((relation): relation is MetadataDefinition<RelationDefinition> => Boolean(relation));
  });
  const forms = draft.entities.map((entity) => generateForm(entity, context, draft));
  const views = draft.entities.map((entity) => generateView(entity, context, draft));
  const pages = [
    ...generateUiFoundation(draft.entities, context),
    ...draft.entities.map((entity) => generatePage(entity, context)),
  ];
  const themes = [generateTheme(context)];
  const navigation = generateNavigation(draft, context);

  application.definition.entityCodes = entities.map((entity) => entity.definition.code);

  return {
    application,
    entities,
    fields,
    relations,
    forms,
    views,
    pages,
    themes,
    navigation,
  };
}

function generateUiFoundation(entities: CreationEntityInput[], context: GeneratorContext): Array<MetadataDefinition<UIDefinition>> {
  const componentCodes = new Set<string>();

  for (const entity of entities) {
    for (const field of entity.fields) {
      componentCodes.add(componentForField(field));
    }
  }

  const atoms = [...componentCodes].map((component): MetadataDefinition<UIDefinition> => {
    const atom: UIAtomDefinition = {
      kind: 'ATOM',
      code: component,
      category: component === 'LOOKUP' ? 'DATA' : 'INPUT',
      renderer: {
        web: component,
        mobile: component,
      },
      propsSchema: {},
      enabled: true,
    };

    return metadata('UI', component, humanName(component), context, atom);
  });

  const templates = entities.map((entity): MetadataDefinition<UIDefinition> => {
    const entityCode = codeFromLabel(entity.name);
    const template: UITemplateDefinition = {
      kind: 'TEMPLATE',
      code: `${entityCode}_FORM_WORKSPACE_TEMPLATE`,
      regions: [{ code: 'main' }],
      enabled: true,
    };

    return metadata('UI', template.code, `${entity.name} Form Workspace Template`, context, template);
  });

  const molecules = entities.flatMap((entity): Array<MetadataDefinition<UIDefinition>> => {
    const entityCode = codeFromLabel(entity.name);

    return entity.fields.map((field): MetadataDefinition<UIDefinition> => {
      const molecule: UIMoleculeDefinition = {
        kind: 'MOLECULE',
        code: `${entityCode}_${fieldCodeFromLabel(field.label).toUpperCase()}_FIELD`,
        atoms: [{ atom: componentForField(field), bind: fieldCodeFromLabel(field.label) }],
        enabled: true,
      };

      return metadata('UI', molecule.code, `${entity.name} ${field.label} Field Composition`, context, molecule);
    });
  });

  const organisms = entities.map((entity): MetadataDefinition<UIDefinition> => {
    const entityCode = codeFromLabel(entity.name);
    const organism: UIOrganismDefinition = {
      kind: 'ORGANISM',
      code: `${entityCode}_SCREEN_COMPOSITION`,
      molecules: entity.fields.map((field) => ({
        molecule: `${entityCode}_${fieldCodeFromLabel(field.label).toUpperCase()}_FIELD`,
        bind: fieldCodeFromLabel(field.label),
      })),
      enabled: true,
    };

    return metadata('UI', organism.code, `${entity.name} UI Composition`, context, organism);
  });

  return [...atoms, ...molecules, ...organisms, ...templates];
}

export function codeFromLabel(label: string): string {
  return label
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase();
}

export function fieldCodeFromLabel(label: string): string {
  const pascal = label
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('');

  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function metadata<TDefinition>(
  type: MetadataType,
  code: string,
  name: string,
  context: GeneratorContext,
  definition: TDefinition,
): MetadataDefinition<TDefinition> {
  return {
    tenantId: context.tenantId,
    domainCode: context.domainCode,
    applicationCode: context.applicationCode,
    type,
    code,
    name,
    version: 1,
    enabled: true,
    definition,
  };
}

function fieldDataType(type: CreationFieldInput['type']): FieldDataType {
  if (type === 'Number' || type === 'Money') {
    return 'number';
  }

  if (type === 'Date' || type === 'Date Time') {
    return 'date';
  }

  if (type === 'Boolean') {
    return 'boolean';
  }

  if (type === 'Lookup' || type === 'User') {
    return 'REFERENCE';
  }

  if (type === 'Attachment') {
    return 'object';
  }

  return 'string';
}

function componentForField(field: CreationFieldInput): string {
  if (field.componentKind === 'Dropdown') {
    return 'SELECT';
  }

  if (field.componentKind === 'Link Data') {
    return 'LOOKUP';
  }

  if (field.type === 'Attachment') {
    return 'FILE_UPLOAD';
  }

  if (field.type === 'Number' || field.type === 'Money') {
    return 'NUMBER_INPUT';
  }

  if (field.type === 'Date' || field.type === 'Date Time') {
    return 'DATE_PICKER';
  }

  if (field.type === 'Boolean') {
    return 'SELECT';
  }

  if (field.type === 'Lookup' || field.type === 'User') {
    return 'LOOKUP';
  }

  if (field.type === 'Long Text') {
    return 'TEXT_AREA';
  }

  return 'TEXT_INPUT';
}

function humanName(code: string): string {
  return code
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
