import type { MetadataDebugTree } from '../../core/api/metadata-client';

export interface StudioNavigationItem {
  code: string;
  label: string;
  group: 'HOME' | 'BUILD' | 'EXPERIENCE' | 'SECURITY' | 'INTEGRATION' | 'OPERATIONS';
  selectionType: string;
  metadataKey?: keyof MetadataDebugTree;
}

const registry: StudioNavigationItem[] = [
  { code: 'HOME', label: 'Home', group: 'HOME', selectionType: 'HOME' },
  { code: 'APPLICATIONS', label: 'Applications', group: 'BUILD', selectionType: 'APPLICATION', metadataKey: 'applications' },
  { code: 'DATA_MODEL', label: 'Data Model', group: 'BUILD', selectionType: 'ENTITY', metadataKey: 'entities' },
  { code: 'FORMS', label: 'Forms', group: 'BUILD', selectionType: 'FORMS', metadataKey: 'forms' },
  { code: 'PAGES', label: 'Pages', group: 'BUILD', selectionType: 'PAGES', metadataKey: 'ui' },
  { code: 'WORKFLOW', label: 'Workflow', group: 'BUILD', selectionType: 'WORKFLOWS', metadataKey: 'workflows' },
  { code: 'AUTOMATION', label: 'Automation', group: 'BUILD', selectionType: 'PROCESSES', metadataKey: 'processes' },
  { code: 'THEME', label: 'Theme', group: 'EXPERIENCE', selectionType: 'THEMES', metadataKey: 'themes' },
  { code: 'NAVIGATION', label: 'Navigation', group: 'EXPERIENCE', selectionType: 'NAVIGATION', metadataKey: 'navigation' },
  { code: 'MOBILE', label: 'Mobile', group: 'EXPERIENCE', selectionType: 'EXPERIENCES', metadataKey: 'experiences' },
  { code: 'TEMPLATES', label: 'Templates', group: 'EXPERIENCE', selectionType: 'TEMPLATES' },
  { code: 'ROLES', label: 'Roles', group: 'SECURITY', selectionType: 'SECURITY', metadataKey: 'securityPolicies' },
  { code: 'POLICIES', label: 'Policies', group: 'SECURITY', selectionType: 'SECURITY', metadataKey: 'securityPolicies' },
  { code: 'AUDIT', label: 'Audit', group: 'SECURITY', selectionType: 'RUNTIME', metadataKey: 'runtimePackages' },
  { code: 'CONNECTORS', label: 'Connectors', group: 'INTEGRATION', selectionType: 'CONNECTORS', metadataKey: 'connectors' },
  { code: 'WEBHOOKS', label: 'Webhooks', group: 'INTEGRATION', selectionType: 'INTEGRATIONS', metadataKey: 'integrations' },
  { code: 'API', label: 'API', group: 'INTEGRATION', selectionType: 'CONNECTORS', metadataKey: 'connectors' },
  { code: 'RUNTIME', label: 'Runtime', group: 'OPERATIONS', selectionType: 'RUNTIME', metadataKey: 'runtimePackages' },
  { code: 'VERSIONS', label: 'Versions', group: 'OPERATIONS', selectionType: 'RUNTIME', metadataKey: 'runtimePackages' },
  { code: 'DEPLOYMENT', label: 'Deployment', group: 'OPERATIONS', selectionType: 'RUNTIME', metadataKey: 'runtimePackages' },
  { code: 'HEALTH', label: 'Health', group: 'OPERATIONS', selectionType: 'HEALTH', metadataKey: 'runtimePackages' },
];

export function createStudioNavigation(tree: MetadataDebugTree): StudioNavigationItem[] {
  return registry.filter((item) => {
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
