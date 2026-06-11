import type { MetadataDebugTree } from '../../core/api/metadata-client';
import type { StudioMode } from '../mode/studio-mode';

export interface StudioNavigationItem {
  code: string;
  label: string;
  group: 'BUILD' | 'AUTOMATE' | 'CONTROL' | 'SYSTEM';
  selectionType: string;
  metadataKey?: keyof MetadataDebugTree;
  expertOnly?: boolean;
}

export const STUDIO_NAVIGATION = 'STUDIO_NAVIGATION';

const registry: StudioNavigationItem[] = [
  { code: 'APPLICATIONS', label: 'Applications', group: 'BUILD', selectionType: 'HOME', metadataKey: 'applications' },
  { code: 'CREATE_APPLICATION', label: 'Create Application', group: 'BUILD', selectionType: 'CREATE_APPLICATION' },
  { code: 'METADATA_DESIGNER', label: 'Metadata Designer', group: 'BUILD', selectionType: 'METADATA_DESIGNER' },
  { code: 'WEB_APP_BUILDER', label: 'Web App Builder', group: 'BUILD', selectionType: 'WEB_BUILDER', metadataKey: 'forms' },
  { code: 'ANDROID_BUILDER', label: 'Android Builder', group: 'BUILD', selectionType: 'ANDROID_BUILDER', metadataKey: 'forms' },
  { code: 'DATA_MODEL', label: 'Data Model', group: 'BUILD', selectionType: 'ENTITY', metadataKey: 'entities', expertOnly: true },
  { code: 'PAGE_BUILDER', label: 'Page Builder', group: 'BUILD', selectionType: 'PAGES', metadataKey: 'ui', expertOnly: true },
  { code: 'WORKFLOW_BUILDER', label: 'Process Builder', group: 'BUILD', selectionType: 'WORKFLOWS', metadataKey: 'workflows' },
  { code: 'PROCESS_BUILDER', label: 'Process Builder', group: 'AUTOMATE', selectionType: 'PROCESSES', metadataKey: 'processes', expertOnly: true },
  { code: 'INTEGRATION_BUILDER', label: 'Integration Builder', group: 'AUTOMATE', selectionType: 'INTEGRATIONS', metadataKey: 'integrations', expertOnly: true },
  { code: 'EVENT_RULES', label: 'Event Rules', group: 'AUTOMATE', selectionType: 'EVENTS', metadataKey: 'events', expertOnly: true },
  { code: 'SECURITY', label: 'Security', group: 'CONTROL', selectionType: 'SECURITY', metadataKey: 'securityPolicies' },
  { code: 'THEME_STUDIO', label: 'Theme Studio', group: 'CONTROL', selectionType: 'THEMES', metadataKey: 'themes', expertOnly: true },
  { code: 'RUNTIME_MONITOR', label: 'Runtime Monitor', group: 'CONTROL', selectionType: 'RUNTIME', metadataKey: 'runtimePackages', expertOnly: true },
  { code: 'AUDIT', label: 'Audit', group: 'CONTROL', selectionType: 'RUNTIME', metadataKey: 'runtimePackages', expertOnly: true },
  { code: 'METADATA_EXPLORER', label: 'Metadata Explorer', group: 'SYSTEM', selectionType: 'METADATA_EXPLORER', expertOnly: true },
  { code: 'RUNTIME_PACKAGE', label: 'Runtime Package', group: 'SYSTEM', selectionType: 'RUNTIME', metadataKey: 'runtimePackages', expertOnly: true },
  { code: 'TRACE_VIEWER', label: 'Trace Viewer', group: 'SYSTEM', selectionType: 'TRACE_VIEWER', expertOnly: true },
];

export function createStudioNavigation(tree: MetadataDebugTree, mode: StudioMode): StudioNavigationItem[] {
  return registry.filter((item) => {
    if (item.expertOnly && mode !== 'EXPERT') {
      return false;
    }

    if (!item.metadataKey) {
      return true;
    }

    const value = tree[item.metadataKey];
    return Array.isArray(value) ? value.length > 0 : Boolean(value);
  });
}

export function firstCodeForItem(item: StudioNavigationItem, tree: MetadataDebugTree): string {
  if (!item.metadataKey) {
    return item.code;
  }

  const value = tree[item.metadataKey];
  return Array.isArray(value) ? value[0] ?? item.code : item.code;
}
