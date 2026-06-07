import type {
  NavigationDefinition,
  UIPageDefinition,
  UITemplateDefinition,
  ViewColumnDefinition,
  ViewDefinition,
} from '@redios/shared';
import type {
  ResolvedUIAtom,
  ResolvedUIMolecule,
  ResolvedUIOrganism,
  ResolvedUIPage as CoreResolvedUIPage,
  ResolvedUIRegion,
  RuntimeDocumentState,
  RuntimeFormField,
  RuntimeFormSection,
} from '@redios/runtime-renderer-core';

export interface RuntimeContext {
  tenantId: string;
  domainCode: string;
  applicationCode: string;
  userId: string;
  permissions: string[];
  roles: string[];
  groups: string[];
  attributes: Record<string, unknown>;
}

export interface RuntimeTheme {
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

export interface RuntimeNavigationItem {
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
  children: RuntimeNavigationItem[];
}

export interface RuntimeNavigation {
  navigation: string;
  layout: RuntimeTheme['layout']['navigation'];
  type: NavigationDefinition['type'];
  theme: {
    code: string;
    density: string;
  };
  items: RuntimeNavigationItem[];
}

export type { ResolvedUIAtom, ResolvedUIMolecule, ResolvedUIOrganism, ResolvedUIRegion, RuntimeDocumentState, RuntimeFormField, RuntimeFormSection };

export interface ResolvedUIPage extends CoreResolvedUIPage {
  page: UIPageDefinition;
  template: UITemplateDefinition;
  theme: RuntimeTheme;
  navigation: RuntimeNavigation;
  shell: {
    theme: RuntimeTheme;
    navigation: RuntimeNavigation;
    page: UIPageDefinition;
  };
}

export interface RuntimeForm {
  entityCode: string;
  form: string;
  name: string;
  version: number;
  layout: string;
  theme: RuntimeTheme;
  sections: RuntimeFormSection[];
}

export interface QueryResult {
  data: Array<Record<string, unknown>>;
  view: {
    code: string;
    entityCode: string;
    type: ViewDefinition['type'];
    columns: ViewColumnDefinition[];
  };
}

