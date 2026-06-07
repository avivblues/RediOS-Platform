import type {
  NavigationDefinition,
  UIAtomDefinition,
  UIPageDefinition,
  UITemplateDefinition,
  ViewColumnDefinition,
  ViewDefinition,
} from '@redios/shared';

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

export interface ResolvedUIAtom {
  code: string;
  category: UIAtomDefinition['category'];
  renderer: UIAtomDefinition['renderer'];
  propsSchema: UIAtomDefinition['propsSchema'];
  bind: string;
}

export interface ResolvedUIMolecule {
  code: string;
  bind: string;
  atoms: ResolvedUIAtom[];
}

export interface ResolvedUIOrganism {
  code: string;
  molecules: ResolvedUIMolecule[];
}

export interface ResolvedUIRegion {
  code: string;
  components: ResolvedUIOrganism[];
}

export interface ResolvedUIPage {
  page: UIPageDefinition;
  template: UITemplateDefinition;
  theme: RuntimeTheme;
  navigation: RuntimeNavigation;
  shell: {
    theme: RuntimeTheme;
    navigation: RuntimeNavigation;
    page: UIPageDefinition;
  };
  regions: ResolvedUIRegion[];
}

export interface RuntimeFormField {
  fieldCode: string;
  component: string;
  order: number;
  required: boolean;
  readonly: boolean;
  visible: boolean;
  binding: {
    source: 'FORM';
    fieldCode: string;
    path: string;
  };
  metadata: Record<string, unknown>;
  relation?: {
    code: string;
    target: string;
    valueField: string;
    displayField?: string;
  };
  view?: {
    code: string;
    entityCode: string;
    type: ViewDefinition['type'];
    columns: ViewColumnDefinition[];
  };
}

export interface RuntimeFormSection {
  code: string;
  title: string;
  order: number;
  fields: RuntimeFormField[];
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

export interface RuntimeDocumentState {
  id?: string;
  data: Record<string, unknown>;
}
