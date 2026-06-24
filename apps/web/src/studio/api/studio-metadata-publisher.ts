import type {
  ActionDefinition,
  ApplicationDefinition,
  EntityDefinition,
  FieldDataType,
  FieldDefinition,
  MetadataDefinition,
  NavigationDefinition,
  ProcessDefinition,
  ProcessStepDefinition,
  SecurityPolicyDefinition,
  ThemeDefinition,
  WorkflowDefinition,
} from '@redios/shared';
import {
  toMetadataCode,
  type StudioApplicationMetadataPackage,
  type StudioDataAttribute,
  type StudioDataObject,
  type StudioProcessDraft,
} from '../metadata/metadata-store';
import type { StudioTarget } from '../builder/types';
import { buildSprint2Metadata, screenPageCode } from './studio-sprint2-publisher';

export interface StudioPublishContext {
  tenantId: string;
  domainCode: string;
  applicationCode: string;
}

export function studioPackageToMetadata(
  pkg: StudioApplicationMetadataPackage,
  context: StudioPublishContext,
): MetadataDefinition[] {
  const applicationCode = pkg.appCode || context.applicationCode;
  const publishContext = { ...context, applicationCode };
  const records: MetadataDefinition[] = [];

  records.push(buildApplicationRecord(pkg, publishContext));

  const entityCodes: string[] = [];

  for (const object of pkg.dataObjects) {
    const entityCode = entityCodeFromObject(object);
    entityCodes.push(entityCode);
    records.push(buildEntityRecord(object, entityCode, publishContext));
    records.push(...buildFieldRecords(object, entityCode, publishContext));
    records.push(...buildEntityActions(entityCode, publishContext));
    records.push(buildWorkflowRecord(entityCode, publishContext));
  }

  records.push(...buildSprint2Metadata(pkg, publishContext));

  for (const process of pkg.processes) {
    const entityCode = entityCodes[0] ?? toMetadataCode(pkg.appName);
    records.push(buildProcessRecord(process, entityCode, publishContext));
  }

  if (pkg.menu.length > 0) {
    records.push(buildNavigationRecord(pkg, publishContext));
  }

  for (const role of pkg.security.roles) {
    records.push(buildSecurityPolicyRecord(role.code, role.label, role.permissions, publishContext));
  }

  if (pkg.theme?.name) {
    records.push(buildThemeRecord(pkg, publishContext));
  }

  return records;
}

function buildApplicationRecord(
  pkg: StudioApplicationMetadataPackage,
  context: StudioPublishContext,
): MetadataDefinition<ApplicationDefinition> {
  const entityCodes = pkg.dataObjects.map((object) => entityCodeFromObject(object));

  return metadata('APPLICATION', context.applicationCode, pkg.appName, context, {
    code: context.applicationCode,
    name: pkg.appName,
    capabilities: [],
    entityCodes,
    enabled: true,
  });
}

function buildEntityRecord(
  object: StudioDataObject,
  entityCode: string,
  context: StudioPublishContext,
): MetadataDefinition<EntityDefinition> {
  const fieldCodes = object.attributes.map((attribute) => fieldCodeFromAttribute(attribute));

  return metadata('ENTITY', entityCode, object.name, context, {
    code: entityCode,
    name: object.name,
    type: object.type === 'SYSTEM_OBJECT' ? 'CONFIGURATION' : 'DOCUMENT',
    fieldCodes,
    actionCodes: ['CREATE', 'READ', 'UPDATE', 'SUBMIT', 'DELETE'],
    workflowCode: `${entityCode}_LIFECYCLE`,
    enabled: true,
  });
}

function buildFieldRecords(
  object: StudioDataObject,
  entityCode: string,
  context: StudioPublishContext,
): MetadataDefinition<FieldDefinition>[] {
  return object.attributes.map((attribute) => {
    const code = fieldCodeFromAttribute(attribute);

    return metadata('FIELD', code, attribute.label ?? attribute.name, context, {
      code,
      name: attribute.label ?? attribute.name,
      entityCode,
      dataType: mapAttributeType(attribute),
      required: Boolean(attribute.required),
      visible: !attribute.hidden,
      readonly: attribute.editable === false,
      validation: {
        unique: attribute.unique,
        secure: attribute.secure,
      },
    });
  });
}

function buildEntityActions(
  entityCode: string,
  context: StudioPublishContext,
): MetadataDefinition<ActionDefinition>[] {
  const actions: Array<{ code: string; label: string; type: ActionDefinition['type'] }> = [
    { code: 'CREATE', label: 'Create', type: 'CREATE' },
    { code: 'READ', label: 'Read', type: 'READ' },
    { code: 'UPDATE', label: 'Update', type: 'UPDATE' },
    { code: 'SUBMIT', label: 'Submit', type: 'CUSTOM' },
    { code: 'DELETE', label: 'Delete', type: 'CANCEL' },
  ];

  return actions.map((action) =>
    metadata('ACTION', action.code, action.label, context, {
      code: action.code,
      entityCode,
      label: action.label,
      type: action.type,
      enabled: true,
      permissions: [],
      behavior: {
        requiresApproval: action.code === 'SUBMIT',
        confirmation: action.code === 'DELETE',
      },
    }),
  );
}

function buildWorkflowRecord(
  entityCode: string,
  context: StudioPublishContext,
): MetadataDefinition<WorkflowDefinition> {
  const code = `${entityCode}_LIFECYCLE`;

  return metadata('WORKFLOW', code, `${entityCode} Lifecycle`, context, {
    code,
    entityCode,
    enabled: true,
    states: [
      { code: 'DRAFT', label: 'Draft', initial: true, type: 'INITIAL' },
      { code: 'SUBMITTED', label: 'Submitted', type: 'NORMAL' },
      { code: 'APPROVED', label: 'Approved', final: true, type: 'FINAL' },
      { code: 'REJECTED', label: 'Rejected', final: true, type: 'FINAL' },
    ],
    transitions: [
      { code: 'SUBMIT', from: 'DRAFT', to: 'SUBMITTED', actionCode: 'SUBMIT', processBinding: `${entityCode}_SUBMIT_PROCESS` },
      { code: 'APPROVE', from: 'SUBMITTED', to: 'APPROVED', actionCode: 'APPROVE' },
      { code: 'REJECT', from: 'SUBMITTED', to: 'REJECTED', actionCode: 'DELETE' },
    ],
  });
}

function buildProcessRecord(
  process: StudioProcessDraft,
  entityCode: string,
  context: StudioPublishContext,
): MetadataDefinition<ProcessDefinition> {
  const approvalSteps = process.steps.filter(
    (step) => !['requester', 'system'].includes(step.approver.toLowerCase()),
  );

  const steps: ProcessStepDefinition[] = [
    { code: 'VALIDATE', type: 'VALIDATION', order: 1, enabled: true },
    ...approvalSteps.map((step, index) => ({
      code: toMetadataCode(step.id),
      type: 'HUMAN_TASK' as const,
      order: index + 2,
      enabled: true,
      config: {
        title: step.label,
        actionCode: 'APPROVE',
        approvalMode: 'SEQUENTIAL',
        assigneeRoles: [normalizeRole(step.approver)],
        condition: step.condition,
        slaHours: 24,
        escalationRole: 'SYSTEM_ADMIN',
        escalationAfterHours: 0,
      },
    })),
    { code: 'NOTIFY', type: 'EVENT', order: approvalSteps.length + 2, enabled: true },
  ];

  return metadata('PROCESS', process.code, process.label, context, {
    code: process.code,
    entityCode,
    enabled: true,
    trigger: {
      actionCode: 'SUBMIT',
      workflowState: 'SUBMITTED',
    },
    steps,
  });
}

function buildNavigationRecord(
  pkg: StudioApplicationMetadataPackage,
  context: StudioPublishContext,
): MetadataDefinition<NavigationDefinition> {
  return metadata('NAVIGATION', 'MAIN_NAVIGATION', 'Main Navigation', context, {
    code: 'MAIN_NAVIGATION',
    name: 'Main Navigation',
    type: 'SIDEBAR',
    enabled: true,
    items: pkg.menu.map((item, index) => ({
      code: toMetadataCode(item.id),
      label: item.label,
      order: index + 1,
      target: {
        type: 'PAGE' as const,
        code: screenPageCode(item.screen),
      },
      visibleWhen: item.permission ? { permissions: [item.permission] } : undefined,
      children: [],
    })),
  });
}

function buildSecurityPolicyRecord(
  roleCode: string,
  roleLabel: string,
  permissions: string[],
  context: StudioPublishContext,
): MetadataDefinition<SecurityPolicyDefinition> {
  const code = `${toMetadataCode(roleCode)}_POLICY`;

  return metadata('SECURITY_POLICY', code, roleLabel, context, {
    code,
    name: roleLabel,
    version: 1,
    target: {
      type: 'APPLICATION',
      code: context.applicationCode,
    },
    effect: 'ALLOW',
    subjects: [{ type: 'ROLE', value: toMetadataCode(roleCode) }],
    rules: {
      read: true,
      create: permissions.some((permission) => permission.includes('create')),
      update: permissions.some((permission) => permission.includes('update') || permission.includes('customize')),
      delete: permissions.some((permission) => permission.includes('delete')),
      visible: true,
      editable: true,
    },
    enabled: true,
  });
}

function buildThemeRecord(
  pkg: StudioApplicationMetadataPackage,
  context: StudioPublishContext,
): MetadataDefinition<ThemeDefinition> {
  const tokens = pkg.theme.tokens ?? {};

  return metadata('THEME', 'STUDIO_THEME', pkg.theme.name, context, {
    code: 'STUDIO_THEME',
    name: pkg.theme.name,
    version: 1,
    enabled: true,
    tokens: {
      colors: {
        primary: tokens.primary ?? '#2563eb',
        secondary: tokens.secondary ?? '#0f172a',
        success: tokens.success ?? '#22c55e',
        warning: tokens.warning ?? '#f59e0b',
        danger: tokens.danger ?? '#ef4444',
        background: tokens.background ?? '#f8fafc',
        surface: tokens.surface ?? '#ffffff',
        text: tokens.text ?? '#0f172a',
      },
      typography: {
        fontFamily: tokens.fontFamily ?? 'Inter, system-ui, sans-serif',
        size: {
          small: '0.875rem',
          medium: '1rem',
          large: '1.25rem',
        },
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
      },
      radius: {
        small: '0.5rem',
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

function metadata<TDefinition>(
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

function entityCodeFromObject(object: StudioDataObject): string {
  if (object.objectCode?.trim()) {
    return toMetadataCode(object.objectCode);
  }

  return toMetadataCode(object.name);
}

function fieldCodeFromAttribute(attribute: StudioDataAttribute): string {
  return attribute.name
    .trim()
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
}

function mapAttributeType(attribute: StudioDataAttribute): FieldDataType {
  switch (attribute.type) {
    case 'number':
    case 'integer':
    case 'decimal':
    case 'double':
    case 'currency':
    case 'percentage':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'date':
    case 'time':
    case 'datetime':
      return 'date';
    case 'lookup':
    case 'uuid':
      return 'REFERENCE';
    case 'json':
    case 'file':
    case 'image':
      return 'object';
    default:
      return 'string';
  }
}

function normalizeRole(value: string): string {
  return toMetadataCode(value);
}

export function resolveStudioPublishContext(
  applicationCode: string,
  session?: {
    tenantId: string;
    domainCode: string;
    applicationCode: string;
  },
): StudioPublishContext {
  return {
    tenantId: session?.tenantId ?? 'demo',
    domainCode: session?.domainCode ?? 'DEFAULT',
    applicationCode,
  };
}

export function applicationDisplayName(applicationCode: string): string {
  return applicationCode
    .split(/[_-]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

export function buildApplicationPackageFromStore(
  applicationCode: string,
  target: StudioTarget,
  loaders: {
    dataObjects: StudioDataObject[];
    queries: StudioApplicationMetadataPackage['queries'];
    actions: StudioApplicationMetadataPackage['actions'];
    connectors: StudioApplicationMetadataPackage['connectors'];
    processes: StudioProcessDraft[];
    menu: StudioApplicationMetadataPackage['menu'];
    screens: StudioApplicationMetadataPackage['screens'];
    security: StudioApplicationMetadataPackage['security'];
    customOrganisms: StudioApplicationMetadataPackage['customOrganisms'];
    theme: StudioApplicationMetadataPackage['theme'];
    canvas: StudioApplicationMetadataPackage['canvas'];
    screenCanvases: StudioApplicationMetadataPackage['screenCanvases'];
  },
): StudioApplicationMetadataPackage {
  const appName = applicationDisplayName(applicationCode);

  return {
    appCode: applicationCode,
    appSlug: applicationCode.toLowerCase().replace(/_/g, '-'),
    appName,
    target,
    dataObjects: loaders.dataObjects,
    queries: loaders.queries,
    actions: loaders.actions,
    connectors: loaders.connectors,
    processes: loaders.processes,
    menu: loaders.menu,
    screens: loaders.screens,
    security: loaders.security,
    customOrganisms: loaders.customOrganisms,
    canvas: loaders.canvas,
    screenCanvases: loaders.screenCanvases,
    theme: loaders.theme,
    publishedAt: new Date().toISOString(),
  };
}
