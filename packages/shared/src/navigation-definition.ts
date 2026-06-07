export type NavigationType = 'SIDEBAR' | 'TOPBAR' | 'MOBILE_TAB';

export type NavigationTargetType = 'PAGE' | 'ACTION' | 'URL';

export interface NavigationVisibilityDefinition {
  permissions?: string[];
}

export interface NavigationItemTargetDefinition {
  type: NavigationTargetType;
  code: string;
}

export interface NavigationItemDefinition {
  code: string;
  label: string;
  icon?: string;
  order: number;
  target: NavigationItemTargetDefinition;
  children?: NavigationItemDefinition[];
  visibleWhen?: NavigationVisibilityDefinition;
}

export interface NavigationDefinition {
  code: string;
  name: string;
  type: NavigationType;
  enabled: boolean;
  items: NavigationItemDefinition[];
}
