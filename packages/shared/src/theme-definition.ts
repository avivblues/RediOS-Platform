export type ThemeNavigationMode = 'SIDEBAR' | 'TOPBAR' | 'HYBRID';

export type ThemeDensity = 'COMPACT' | 'NORMAL' | 'COMFORTABLE';

export interface ThemeColorTokens {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  danger: string;
  background: string;
  surface: string;
  text: string;
}

export interface ThemeTypographyTokens {
  fontFamily: string;
  size: {
    small: string;
    medium: string;
    large: string;
  };
}

export interface ThemeSpacingTokens {
  xs: string;
  sm: string;
  md: string;
  lg: string;
}

export interface ThemeRadiusTokens {
  small: string;
  medium: string;
  large: string;
}

export interface ThemeDefinition {
  code: string;
  name: string;
  version: number;
  enabled: boolean;
  extends?: string;
  tokens: {
    colors: ThemeColorTokens;
    typography: ThemeTypographyTokens;
    spacing: ThemeSpacingTokens;
    radius: ThemeRadiusTokens;
  };
  layout: {
    navigation: ThemeNavigationMode;
    density: ThemeDensity;
  };
  assets: {
    logo?: string;
    favicon?: string;
  };
}
