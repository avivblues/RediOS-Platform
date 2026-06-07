import { createContext, useContext, useMemo, type PropsWithChildren } from 'react';
import type { TextStyle, ViewStyle } from 'react-native';
import type { MobileRuntimeTheme } from '../api/mobile-runtime-types';

export interface MobileThemeContextValue {
  theme: MobileRuntimeTheme;
  controlStyle: ViewStyle;
  textStyle: TextStyle;
}

const ThemeContext = createContext<MobileThemeContextValue | undefined>(undefined);

export function MobileThemeProvider({ theme, children }: PropsWithChildren<{ theme: MobileRuntimeTheme }>) {
  const value = useMemo<MobileThemeContextValue>(
    () => ({
      theme,
      controlStyle: {
        borderColor: theme.tokens.colors.secondary,
        borderRadius: Number.parseInt(theme.tokens.radius.medium, 10) || 8,
        padding: Number.parseInt(theme.tokens.spacing.sm, 10) || 8,
        backgroundColor: theme.tokens.colors.surface,
      },
      textStyle: {
        color: theme.tokens.colors.text,
        fontSize: Number.parseInt(theme.tokens.typography.size.medium, 10) || 14,
      },
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useMobileTheme(): MobileThemeContextValue {
  const value = useContext(ThemeContext);

  if (!value) {
    throw new Error('MobileThemeProvider is required.');
  }

  return value;
}
