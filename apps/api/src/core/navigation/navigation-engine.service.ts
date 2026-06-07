import { Injectable, NotFoundException } from '@nestjs/common';
import type { NavigationDefinition, NavigationItemDefinition, RuntimeContext } from '@redios/shared';
import { MetadataResolver } from '../metadata/metadata-resolver.service';
import { SecurityEngine } from '../security/security-engine.service';
import { ThemeEngine, type RuntimeTheme } from '../theme/theme-engine.service';

export interface RuntimeNavigationItem {
  code: string;
  label: string;
  icon?: string;
  order: number;
  target: NavigationItemDefinition['target'];
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
    density: RuntimeTheme['layout']['density'];
  };
  items: RuntimeNavigationItem[];
}

@Injectable()
export class NavigationEngine {
  constructor(
    private readonly metadataResolver: MetadataResolver,
    private readonly themeEngine: ThemeEngine,
    private readonly securityEngine: SecurityEngine,
  ) {}

  async compose(context: RuntimeContext, navigationCode?: string): Promise<RuntimeNavigation> {
    this.securityEngine.validateContext(context);
    const navigationMetadata = await this.metadataResolver.resolveNavigation(context, navigationCode);

    if (!navigationMetadata) {
      throw new NotFoundException(`Metadata NAVIGATION:${navigationCode ?? '(current)'} was not found.`);
    }

    const theme = await this.themeEngine.compose(context);
    const navigation = navigationMetadata.definition;

    return {
      navigation: navigation.code,
      layout: theme.layout.navigation,
      type: navigation.type,
      theme: {
        code: theme.theme,
        density: theme.layout.density,
      },
      items: this.filterItems(context, navigation.items),
    };
  }

  private filterItems(context: RuntimeContext, items: NavigationItemDefinition[]): RuntimeNavigationItem[] {
    return items
      .filter((item) => this.visible(context, item))
      .sort((left, right) => left.order - right.order)
      .map((item) => this.toRuntimeItem(context, item));
  }

  private toRuntimeItem(context: RuntimeContext, item: NavigationItemDefinition): RuntimeNavigationItem {
    return {
      code: item.code,
      label: item.label,
      icon: item.icon,
      order: item.order,
      target: item.target,
      page: item.target.type === 'PAGE' ? item.target.code : undefined,
      action: item.target.type === 'ACTION' ? item.target.code : undefined,
      url: item.target.type === 'URL' ? item.target.code : undefined,
      children: this.filterItems(context, item.children ?? []),
    };
  }

  private visible(context: RuntimeContext, item: NavigationItemDefinition): boolean {
    const permissions = item.visibleWhen?.permissions ?? [];
    return permissions.every((permission) => context.permissions.includes(permission));
  }
}
