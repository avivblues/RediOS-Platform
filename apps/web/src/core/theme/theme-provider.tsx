import { createContext, useContext, useEffect, useMemo, type PropsWithChildren } from 'react';
import type { RuntimeTheme } from '../renderer/runtime-types';

const ThemeContext = createContext<RuntimeTheme | undefined>(undefined);

export function ThemeProvider({ theme, children }: PropsWithChildren<{ theme: RuntimeTheme }>) {
  const variables = useMemo(() => toCssVariables(theme), [theme]);

  useEffect(() => {
    const root = document.documentElement;

    for (const [key, value] of Object.entries(variables)) {
      root.style.setProperty(key, value);
    }

    return () => {
      for (const key of Object.keys(variables)) {
        root.style.removeProperty(key);
      }
    };
  }, [variables]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useRuntimeTheme(): RuntimeTheme {
  const theme = useContext(ThemeContext);

  if (!theme) {
    throw new Error('ThemeProvider is required.');
  }

  return theme;
}

function toCssVariables(theme: RuntimeTheme): Record<string, string> {
  return {
    '--redios-color-primary': theme.tokens.colors.primary,
    '--redios-color-secondary': theme.tokens.colors.secondary,
    '--redios-color-success': theme.tokens.colors.success,
    '--redios-color-warning': theme.tokens.colors.warning,
    '--redios-color-danger': theme.tokens.colors.danger,
    '--redios-color-background': theme.tokens.colors.background,
    '--redios-color-surface': theme.tokens.colors.surface,
    '--redios-color-text': theme.tokens.colors.text,
    '--redios-font-family': theme.tokens.typography.fontFamily,
    '--redios-font-size-small': theme.tokens.typography.size.small,
    '--redios-font-size-medium': theme.tokens.typography.size.medium,
    '--redios-font-size-large': theme.tokens.typography.size.large,
    '--redios-spacing-xs': theme.tokens.spacing.xs,
    '--redios-spacing-sm': theme.tokens.spacing.sm,
    '--redios-spacing-md': theme.tokens.spacing.md,
    '--redios-spacing-lg': theme.tokens.spacing.lg,
    '--redios-radius-small': theme.tokens.radius.small,
    '--redios-radius-medium': theme.tokens.radius.medium,
    '--redios-radius-large': theme.tokens.radius.large,
  };
}
