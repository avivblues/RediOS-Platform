import type {
  ConnectorDefinition,
  FormDefinition,
  FormFieldDefinition,
  IntegrationDefinition,
  MetadataDefinition,
  UIDefinition,
  UIPageDefinition,
  ViewDefinition,
} from '@redios/shared';
import type { CanvasComponent } from '../builder/types';
import {
  toMetadataCode,
  type StudioApplicationMetadataPackage,
  type StudioDataAttribute,
  type StudioDataObject,
  type StudioQueryColumnDraft,
  type StudioQueryDraft,
  type StudioScreenDraft,
} from '../metadata/metadata-store';
import type { StudioPublishContext } from './studio-metadata-publisher';

const STANDARD_ATOMS = [
  'TEXT_INPUT',
  'TEXT_AREA',
  'NUMBER_INPUT',
  'DATE_PICKER',
  'SELECT',
  'LOOKUP',
  'FILE_UPLOAD',
  'BUTTON',
  'BADGE',
  'LABEL',
  'CARD',
  'TABLE',
] as const;

export function buildSprint2Metadata(
  pkg: StudioApplicationMetadataPackage,
  context: StudioPublishContext,
): MetadataDefinition[] {
  const records: MetadataDefinition[] = [];
  const viewCodes = new Set<string>();

  records.push(...buildViewRecordsFromQueries(pkg, context, viewCodes));
  records.push(...buildFallbackEntityListViews(pkg, context, viewCodes));
  records.push(...buildStudioUiFoundation(context));
  records.push(...buildFormRecordsFromScreens(pkg, context));
  records.push(...buildUIPageRecordsFromScreens(pkg, context, viewCodes));
  records.push(...buildConnectorAndIntegrationRecords(pkg, context));

  return records;
}

function buildViewRecordsFromQueries(
  pkg: StudioApplicationMetadataPackage,
  context: StudioPublishContext,
  viewCodes: Set<string>,
): MetadataDefinition<ViewDefinition>[] {
  return pkg.queries.map((query) => {
    viewCodes.add(query.code);
    return studioRecord('VIEW', query.code, query.label, context, viewFromQuery(query));
  });
}

function buildFallbackEntityListViews(
  pkg: StudioApplicationMetadataPackage,
  context: StudioPublishContext,
  viewCodes: Set<string>,
): MetadataDefinition<ViewDefinition>[] {
  const records: MetadataDefinition<ViewDefinition>[] = [];

  for (const object of pkg.dataObjects) {
    const entityCode = entityCodeFromObject(object);
    const code = `${entityCode}_LIST`;

    if (viewCodes.has(code) || pkg.queries.some((query) => query.objectName === object.name && query.mode === 'list')) {
      continue;
    }

    viewCodes.add(code);
    records.push(studioRecord('VIEW', code, `${object.name} List`, context, {
      code,
      entityCode,
      type: 'TABLE',
      columns: object.attributes
        .filter((attribute) => !attribute.hidden)
        .slice(0, 8)
        .map((attribute) => ({
          field: fieldCodeFromName(attribute.name),
          label: attribute.label ?? attribute.name,
          visible: true,
          sortable: true,
          filterable: attribute.type !== 'json' && attribute.type !== 'file',
        })),
      filters: [],
      sorting: object.attributes[0]
        ? { field: fieldCodeFromName(object.attributes[0].name), direction: 'ASC' }
        : undefined,
      enabled: true,
    }));
  }

  return records;
}

function buildFormRecordsFromScreens(
  pkg: StudioApplicationMetadataPackage,
  context: StudioPublishContext,
): MetadataDefinition<FormDefinition>[] {
  const records: MetadataDefinition<FormDefinition>[] = [];
  const publishedFormCodes = new Set<string>();

  for (const screen of pkg.screens) {
    if (!isFormScreen(screen.mode)) {
      continue;
    }

    const object = resolveScreenObject(pkg, screen);
    if (!object) {
      continue;
    }

    const entityCode = entityCodeFromObject(object);
    const formCode = screen.mode === 'create' || screen.mode === 'edit'
      ? `${entityCode}_FORM`
      : `${toMetadataCode(screen.code)}_FORM`;

    if (publishedFormCodes.has(formCode)) {
      continue;
    }

    publishedFormCodes.add(formCode);
    const canvas = pkg.screenCanvases[screen.code] ?? pkg.canvas;
    const fields = formFieldsFromCanvas(canvas, object);

    records.push(studioRecord('FORM', formCode, screen.label, context, {
      code: formCode,
      entityCode,
      name: screen.label,
      version: 1,
      enabled: true,
      layout: {
        type: 'SECTION',
        sections: [
          {
            code: 'MAIN',
            title: screen.label,
            order: 1,
            fields: fields.length > 0 ? fields : defaultFormFields(object),
          },
        ],
      },
    }));
  }

  for (const object of pkg.dataObjects) {
    const entityCode = entityCodeFromObject(object);
    const formCode = `${entityCode}_FORM`;

    if (publishedFormCodes.has(formCode)) {
      continue;
    }

    publishedFormCodes.add(formCode);
    records.push(studioRecord('FORM', formCode, `${object.name} Form`, context, {
      code: formCode,
      entityCode,
      name: `${object.name} Form`,
      version: 1,
      enabled: true,
      layout: {
        type: 'SECTION',
        sections: [
          {
            code: 'GENERAL',
            title: `${object.name} Details`,
            order: 1,
            fields: defaultFormFields(object),
          },
        ],
      },
    }));
  }

  return records;
}

function buildUIPageRecordsFromScreens(
  pkg: StudioApplicationMetadataPackage,
  context: StudioPublishContext,
  viewCodes: Set<string>,
): MetadataDefinition<UIDefinition>[] {
  const records: MetadataDefinition<UIPageDefinition>[] = [];
  const publishedPageCodes = new Set<string>();

  for (const screen of pkg.screens) {
    const pageCode = pageCodeFromScreen(screen);
    if (publishedPageCodes.has(pageCode)) {
      continue;
    }

    publishedPageCodes.add(pageCode);
    const object = resolveScreenObject(pkg, screen);
    const entityCode = object ? entityCodeFromObject(object) : undefined;
    const viewCode = resolveViewCode(pkg, screen, object, viewCodes);
    const { template, regions } = pageLayoutForScreen(screen.mode);

    records.push(studioRecord('UI', pageCode, screen.label, context, {
      kind: 'PAGE',
      code: pageCode,
      entityCode,
      viewCode,
      themeCode: 'STUDIO_THEME',
      template,
      regions,
      actions: entityCode ? ['CREATE', 'READ', 'UPDATE', 'SUBMIT'] : undefined,
      relations: [],
      enabled: true,
    }));
  }

  for (const menuItem of pkg.menu) {
    const pageCode = screenPageCode(menuItem.screen);

    if (publishedPageCodes.has(pageCode)) {
      continue;
    }

    publishedPageCodes.add(pageCode);
    records.push(studioRecord('UI', pageCode, menuItem.label, context, {
      kind: 'PAGE',
      code: pageCode,
      themeCode: 'STUDIO_THEME',
      template: 'SINGLE_PAGE',
      regions: {
        HEADER: ['ACTION_BAR'],
        CONTENT: ['DETAIL_CARD'],
      },
      enabled: true,
    }));
  }

  return records;
}

function buildStudioUiFoundation(context: StudioPublishContext): MetadataDefinition<UIDefinition>[] {
  const records: MetadataDefinition<UIDefinition>[] = [];

  for (const code of STANDARD_ATOMS) {
    records.push(studioRecord('UI', code, humanizeCode(code), context, {
      kind: 'ATOM',
      code,
      category: code === 'LOOKUP' || code === 'TABLE' ? 'DATA' : code === 'BUTTON' ? 'ACTION' : 'INPUT',
      renderer: { web: code, mobile: code },
      propsSchema: {},
      enabled: true,
    }));
  }

  const molecules = [
    { code: 'FORM_FIELD', atoms: [{ atom: 'LABEL', bind: 'label' }, { atom: 'TEXT_INPUT', bind: 'value' }] },
    { code: 'ACTION_BUTTON', atoms: [{ atom: 'BUTTON', bind: 'action' }] },
    { code: 'STATUS_BADGE', atoms: [{ atom: 'BADGE', bind: 'status' }] },
    { code: 'SEARCH_BOX', atoms: [{ atom: 'TEXT_INPUT', bind: 'query' }, { atom: 'BUTTON', bind: 'submit' }] },
  ] as const;

  for (const molecule of molecules) {
    records.push(studioRecord('UI', molecule.code, humanizeCode(molecule.code), context, {
      kind: 'MOLECULE',
      code: molecule.code,
      atoms: [...molecule.atoms],
      enabled: true,
    }));
  }

  const organisms = [
    { code: 'FORM_SECTION', molecules: [{ molecule: 'FORM_FIELD', bind: 'fields' }] },
    { code: 'DATA_TABLE', molecules: [{ molecule: 'SEARCH_BOX', bind: 'search' }, { molecule: 'FORM_FIELD', bind: 'filters' }] },
    { code: 'ACTION_BAR', molecules: [{ molecule: 'ACTION_BUTTON', bind: 'actions' }] },
    { code: 'DETAIL_CARD', molecules: [{ molecule: 'STATUS_BADGE', bind: 'status' }, { molecule: 'FORM_FIELD', bind: 'fields' }] },
    { code: 'TIMELINE', molecules: [{ molecule: 'STATUS_BADGE', bind: 'events' }] },
  ] as const;

  for (const organism of organisms) {
    records.push(studioRecord('UI', organism.code, humanizeCode(organism.code), context, {
      kind: 'ORGANISM',
      code: organism.code,
      molecules: [...organism.molecules],
      enabled: true,
    }));
  }

  const templates = [
    { code: 'SINGLE_PAGE', regions: ['HEADER', 'CONTENT'] },
    { code: 'MASTER_DETAIL', regions: ['HEADER', 'CONTENT', 'SIDEBAR'] },
    { code: 'MOBILE_STACK', regions: ['HEADER', 'CONTENT'] },
    { code: 'DASHBOARD_LAYOUT', regions: ['HEADER', 'CONTENT', 'SIDEBAR'] },
  ] as const;

  for (const template of templates) {
    records.push(studioRecord('UI', template.code, humanizeCode(template.code), context, {
      kind: 'TEMPLATE',
      code: template.code,
      regions: template.regions.map((code) => ({ code })),
      enabled: true,
    }));
  }

  return records;
}

function buildConnectorAndIntegrationRecords(
  pkg: StudioApplicationMetadataPackage,
  context: StudioPublishContext,
): MetadataDefinition<ConnectorDefinition | IntegrationDefinition>[] {
  const records: MetadataDefinition<ConnectorDefinition | IntegrationDefinition>[] = [];

  for (const api of pkg.connectors.filter((connector) => connector.source === 'EXTERNAL')) {
    const connectorCode = `${api.code}_CONNECTOR`;

    records.push(studioRecord('CONNECTOR', connectorCode, api.label, context, {
      code: connectorCode,
      type: api.method === 'POST' || api.method === 'PUT' || api.method === 'PATCH' ? 'WEBHOOK' : 'HTTP',
      configSchema: {
        endpoint: api.url,
        method: api.method,
      },
      authType: mapConnectorAuth(api.auth),
      enabled: true,
      version: 1,
    }));

    records.push(studioRecord('INTEGRATION', `${api.code}_INTEGRATION`, api.label, context, {
      code: `${api.code}_INTEGRATION`,
      name: api.label,
      enabled: true,
      version: 1,
      trigger: { type: 'MANUAL' },
      connector: {
        type: api.method === 'POST' || api.method === 'PUT' || api.method === 'PATCH' ? 'WEBHOOK' : 'HTTP',
        connectorCode,
      },
      mapping: {
        input: {
          'document.id': 'external.reference',
          'action.code': 'external.action',
        },
        output: {},
      },
      errorPolicy: {
        retry: true,
        maxAttempts: 2,
        delayMs: 0,
        fallback: 'TRACE_ONLY',
      },
    }));
  }

  return records;
}

function viewFromQuery(query: StudioQueryDraft): ViewDefinition {
  const entityCode = toMetadataCode(query.objectName);
  const columns = (query.columns?.length
    ? query.columns
    : query.fields.map((field): StudioQueryColumnDraft => ({
        objectName: query.objectName,
        field,
        alias: field,
        visible: true,
        sortType: 'none',
      })))
    .filter((column) => column.visible !== false)
    .map((column) => ({
      field: column.field,
      label: column.alias || column.field,
      visible: true,
      sortable: column.sortType !== 'none',
      filterable: Boolean(column.criteria),
    }));

  const sortColumn = query.columns?.find((column) => column.sortType && column.sortType !== 'none');

  return {
    code: query.code,
    entityCode,
    type: viewTypeFromMode(query.mode),
    columns,
    filters: query.filter
      ? [{ field: query.fields[0] ?? columns[0]?.field ?? 'id', operator: 'EQ' as const }]
      : [],
    sorting: sortColumn
      ? { field: sortColumn.field, direction: sortColumn.sortType === 'descending' ? 'DESC' : 'ASC' }
      : query.sort
        ? { field: query.sort, direction: 'ASC' }
        : undefined,
    enabled: true,
  };
}

function formFieldsFromCanvas(canvas: CanvasComponent[], object: StudioDataObject): FormFieldDefinition[] {
  const bound = flattenCanvas(canvas).filter((component) => component.binding?.field);

  return bound.map((component, index) => {
    const attribute = object.attributes.find((item) => item.name === component.binding?.field);
    const fieldCode = fieldCodeFromName(component.binding?.field ?? component.label);

    return {
      fieldCode,
      component: componentToFormComponent(component.type, attribute),
      order: index + 1,
      required: Boolean(attribute?.required),
      readonly: component.readonly ?? attribute?.editable === false,
      visible: attribute?.hidden !== true,
    };
  });
}

function defaultFormFields(object: StudioDataObject): FormFieldDefinition[] {
  return object.attributes
    .filter((attribute) => !attribute.hidden)
    .map((attribute, index) => ({
      fieldCode: fieldCodeFromName(attribute.name),
      component: componentFromAttributeType(attribute.type),
      order: index + 1,
      required: Boolean(attribute.required),
      readonly: attribute.editable === false,
      visible: true,
    }));
}

function flattenCanvas(components: CanvasComponent[]): CanvasComponent[] {
  const flattened: CanvasComponent[] = [];

  for (const component of components) {
    flattened.push(component);

    if (component.children?.length) {
      flattened.push(...flattenCanvas(component.children));
    }
  }

  return flattened;
}

function resolveScreenObject(pkg: StudioApplicationMetadataPackage, screen: StudioScreenDraft) {
  if (!screen.objectName) {
    return pkg.dataObjects[0];
  }

  return pkg.dataObjects.find((object) => object.name === screen.objectName) ?? pkg.dataObjects[0];
}

function resolveViewCode(
  pkg: StudioApplicationMetadataPackage,
  screen: StudioScreenDraft,
  object: StudioDataObject | undefined,
  viewCodes: Set<string>,
) {
  const canvas = pkg.screenCanvases[screen.code] ?? pkg.canvas;
  const queryFromCanvas = flattenCanvas(canvas)
    .map((component) => component.template?.dataSource?.query)
    .find(Boolean);

  if (queryFromCanvas && viewCodes.has(queryFromCanvas)) {
    return queryFromCanvas;
  }

  const query = pkg.queries.find((item) => {
    if (object && item.objectName !== object.name) {
      return false;
    }

    return screen.mode === 'table' || screen.mode === 'list'
      ? item.mode === 'list'
      : item.mode === 'lookup';
  });

  if (query) {
    return query.code;
  }

  if (object) {
    const fallback = `${entityCodeFromObject(object)}_LIST`;
    if (viewCodes.has(fallback)) {
      return fallback;
    }
  }

  return pkg.queries[0]?.code;
}

function pageCodeFromScreen(screen: StudioScreenDraft) {
  return screenPageCode(screen.code);
}

export function screenPageCode(screenCode: string) {
  const normalized = toMetadataCode(screenCode);
  return normalized.endsWith('_PAGE') ? normalized : `${normalized}_PAGE`;
}

function pageLayoutForScreen(mode: StudioScreenDraft['mode']): { template: string; regions: Record<string, string[]> } {
  if (mode === 'table' || mode === 'list') {
    return {
      template: 'MASTER_DETAIL',
      regions: {
        HEADER: ['ACTION_BAR'],
        CONTENT: ['DATA_TABLE'],
        SIDEBAR: ['TIMELINE'],
      },
    };
  }

  if (mode === 'detail') {
    return {
      template: 'MASTER_DETAIL',
      regions: {
        HEADER: ['ACTION_BAR'],
        CONTENT: ['DETAIL_CARD'],
        SIDEBAR: ['TIMELINE'],
      },
    };
  }

  return {
    template: 'SINGLE_PAGE',
    regions: {
      HEADER: ['ACTION_BAR'],
      CONTENT: ['FORM_SECTION'],
    },
  };
}

function isFormScreen(mode: StudioScreenDraft['mode']) {
  return mode === 'create' || mode === 'edit' || mode === 'detail';
}

function viewTypeFromMode(mode: StudioQueryDraft['mode']): ViewDefinition['type'] {
  if (mode === 'lookup') {
    return 'LOOKUP';
  }

  if (mode === 'report' || mode === 'dashboard') {
    return 'REPORT_SOURCE';
  }

  return 'TABLE';
}

function componentToFormComponent(componentType: string, attribute?: StudioDataAttribute) {
  const mapped: Record<string, string> = {
    TextInput: 'TEXT_INPUT',
    TextArea: 'TEXT_AREA',
    NumberInput: 'NUMBER_INPUT',
    DateInput: 'DATE_PICKER',
    TimeInput: 'DATE_PICKER',
    EmailInput: 'TEXT_INPUT',
    PasswordInput: 'TEXT_INPUT',
    PhoneInput: 'TEXT_INPUT',
    UrlInput: 'TEXT_INPUT',
    Checkbox: 'SELECT',
    Lookup: 'LOOKUP',
    Dropdown: 'SELECT',
    UploadField: 'FILE_UPLOAD',
    ImageUpload: 'FILE_UPLOAD',
    Select: 'SELECT',
  };

  return mapped[componentType] ?? componentFromAttributeType(attribute?.type ?? 'text');
}

function componentFromAttributeType(type: StudioDataAttribute['type']) {
  if (['number', 'integer', 'decimal', 'double', 'currency', 'percentage'].includes(type)) {
    return 'NUMBER_INPUT';
  }

  if (['date', 'time', 'datetime'].includes(type)) {
    return 'DATE_PICKER';
  }

  if (type === 'boolean' || type === 'enum') {
    return 'SELECT';
  }

  if (type === 'lookup' || type === 'uuid') {
    return 'LOOKUP';
  }

  if (type === 'longText' || type === 'json') {
    return 'TEXT_AREA';
  }

  if (type === 'file' || type === 'image') {
    return 'FILE_UPLOAD';
  }

  return 'TEXT_INPUT';
}

function mapConnectorAuth(auth: 'None' | 'API Key' | 'Bearer Token'): ConnectorDefinition['authType'] {
  if (auth === 'API Key') {
    return 'API_KEY';
  }

  if (auth === 'Bearer Token') {
    return 'TOKEN';
  }

  return 'NONE';
}

function entityCodeFromObject(object: StudioDataObject) {
  if (object.objectCode?.trim()) {
    return toMetadataCode(object.objectCode);
  }

  return toMetadataCode(object.name);
}

function fieldCodeFromName(name: string) {
  return name
    .trim()
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
}

function humanizeCode(code: string) {
  return code
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function studioRecord<TDefinition>(
  type: MetadataDefinition['type'],
  code: string,
  name: string,
  context: StudioPublishContext,
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
