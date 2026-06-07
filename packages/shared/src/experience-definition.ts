export type ExperiencePlatform = 'WEB' | 'MOBILE' | 'TABLET';

export type ExperienceLayoutMode = 'DESKTOP_WORKSPACE' | 'MOBILE_STACK' | 'TABLET_SPLIT';

export type ExperienceInteractionMode = 'MOUSE_KEYBOARD' | 'TOUCH' | 'HYBRID';

export interface ExperienceConditions {
  platform?: ExperiencePlatform;
  device?: string;
  role?: string;
  roles?: string[];
  attribute?: {
    key: string;
    value: unknown;
  };
  attributes?: Record<string, unknown>;
}

export interface ExperienceVariantDefinition {
  platform: ExperiencePlatform;
  pageCode: string;
  templateCode?: string;
  navigationCode?: string;
  themeCode?: string;
  layoutMode: ExperienceLayoutMode;
  interaction: ExperienceInteractionMode;
  conditions?: ExperienceConditions;
}

export interface ExperienceDefinition {
  code: string;
  entityCode: string;
  enabled: boolean;
  priority: number;
  conditions?: ExperienceConditions;
  variants: ExperienceVariantDefinition[];
}

export interface ResolvedExperience {
  selected: string;
  entityCode: string;
  platform: ExperiencePlatform;
  page: string;
  template?: string;
  navigation?: string;
  theme?: string;
  layout: ExperienceLayoutMode;
  interaction: ExperienceInteractionMode;
}
