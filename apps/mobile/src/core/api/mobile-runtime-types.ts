import type { NavigationDefinition, UIPageDefinition, UITemplateDefinition, ViewColumnDefinition } from '@redios/shared';
import type {
  ResolvedUIAtom,
  ResolvedUIMolecule,
  ResolvedUIOrganism,
  ResolvedUIPage as CoreResolvedUIPage,
  ResolvedUIRegion,
  RuntimeDocumentState,
  RuntimeExperience,
  RuntimeFormField,
  RuntimeFormSection,
} from '@redios/runtime-renderer-core';
import type { ResolvedSyncPolicy } from '@redios/shared';

export interface MobileRuntimeContext {
  tenantId: string;
  domainCode: string;
  applicationCode: string;
  userId: string;
  permissions: string[];
  roles: string[];
  groups: string[];
  attributes: Record<string, unknown>;
}

export interface MobileRuntimeTheme {
  theme: string;
  tokens: {
    colors: Record<string, string>;
    typography: {
      fontFamily: string;
      size: Record<string, string>;
    };
    spacing: Record<string, string>;
    radius: Record<string, string>;
  };
  layout: {
    navigation: 'SIDEBAR' | 'TOPBAR' | 'HYBRID';
    density: string;
  };
  assets: Record<string, string | undefined>;
}

export interface MobileNavigationItem {
  code: string;
  label: string;
  icon?: string;
  order: number;
  target: {
    type: 'PAGE' | 'ACTION' | 'URL';
    code: string;
  };
  page?: string;
  action?: string;
  url?: string;
  children: MobileNavigationItem[];
}

export interface MobileNavigation {
  navigation: string;
  layout: MobileRuntimeTheme['layout']['navigation'];
  type: NavigationDefinition['type'];
  theme: {
    code: string;
    density: string;
  };
  items: MobileNavigationItem[];
}

export interface MobileResolvedUIPage extends CoreResolvedUIPage {
  page: UIPageDefinition;
  template: UITemplateDefinition;
  theme: MobileRuntimeTheme;
  navigation: MobileNavigation;
}

export interface MobileRuntimeForm {
  entityCode: string;
  form: string;
  name: string;
  version: number;
  layout: string;
  theme: MobileRuntimeTheme;
  sections: RuntimeFormSection[];
}

export interface MobileQueryResult {
  data: Array<Record<string, unknown>>;
  view: {
    code: string;
    entityCode: string;
    type: string;
    columns: ViewColumnDefinition[];
  };
}

export interface MobileRuntimeActionRequest {
  entityCode: string;
  documentId?: string;
  actionCode: string;
  data: Record<string, unknown>;
}

export interface MobileSyncBootstrapPackage {
  metadataVersion: number;
  entities: unknown[];
  forms: unknown[];
  workflow: unknown[];
  security: unknown[];
  navigation: unknown[];
  theme: unknown[];
  experience: unknown[];
}

export type {
  ResolvedSyncPolicy,
  ResolvedUIAtom,
  ResolvedUIMolecule,
  ResolvedUIOrganism,
  ResolvedUIRegion,
  RuntimeDocumentState,
  RuntimeExperience,
  RuntimeFormField,
  RuntimeFormSection,
};
