import { Injectable, NotFoundException } from '@nestjs/common';
import type { RuntimeContext, ThemeDefinition } from '@redios/shared';
import { MetadataResolver } from '../metadata/metadata-resolver.service';

export interface RuntimeTheme {
  theme: string;
  name: string;
  version: number;
  tokens: ThemeDefinition['tokens'];
  layout: ThemeDefinition['layout'];
  assets: ThemeDefinition['assets'];
}

@Injectable()
export class ThemeEngine {
  constructor(private readonly metadataResolver: MetadataResolver) {}

  async compose(context: RuntimeContext, themeCode?: string): Promise<RuntimeTheme> {
    const themeMetadata = await this.metadataResolver.resolveTheme(context, themeCode);

    if (!themeMetadata) {
      throw new NotFoundException(`Metadata THEME:${themeCode ?? '(current)'} was not found.`);
    }

    const theme = themeMetadata.definition;
    const inherited = theme.extends ? (await this.metadataResolver.resolveTheme(context, theme.extends))?.definition : undefined;
    const merged = this.mergeTheme(inherited, theme);

    return {
      theme: merged.code,
      name: merged.name,
      version: merged.version,
      tokens: merged.tokens,
      layout: merged.layout,
      assets: merged.assets,
    };
  }

  private mergeTheme(base: ThemeDefinition | undefined, override: ThemeDefinition): ThemeDefinition {
    if (!base) {
      return override;
    }

    return {
      ...base,
      ...override,
      tokens: {
        colors: {
          ...base.tokens.colors,
          ...override.tokens.colors,
        },
        typography: {
          ...base.tokens.typography,
          ...override.tokens.typography,
          size: {
            ...base.tokens.typography.size,
            ...override.tokens.typography.size,
          },
        },
        spacing: {
          ...base.tokens.spacing,
          ...override.tokens.spacing,
        },
        radius: {
          ...base.tokens.radius,
          ...override.tokens.radius,
        },
      },
      layout: {
        ...base.layout,
        ...override.layout,
      },
      assets: {
        ...base.assets,
        ...override.assets,
      },
    };
  }
}
