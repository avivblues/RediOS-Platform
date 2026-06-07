import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type {
  ExperienceConditions,
  ExperienceDefinition,
  ExperiencePlatform,
  ExperienceVariantDefinition,
  ResolvedExperience,
  RuntimeContext,
} from '@redios/shared';
import { METADATA_PROVIDER, type MetadataProvider } from '../metadata/metadata-provider.interface';

export interface ExperienceResolveInput {
  platform?: ExperiencePlatform;
  device?: string;
}

@Injectable()
export class ExperienceEngine {
  constructor(@Inject(METADATA_PROVIDER) private readonly metadataProvider: MetadataProvider) {}

  async resolveExperience(
    context: RuntimeContext,
    entityCode: string,
    input: ExperienceResolveInput = {},
  ): Promise<ResolvedExperience> {
    const platform = input.platform ?? 'WEB';
    const definitions = await this.metadataProvider.findMetadata(context, {
      type: 'EXPERIENCE',
      enabledOnly: true,
    });
    const candidates = definitions
      .map((metadata) => metadata.definition as ExperienceDefinition)
      .filter((definition) => definition.enabled && definition.entityCode === entityCode)
      .filter((definition) => this.conditionsMatch(context, definition.conditions, platform, input.device))
      .sort((left, right) => right.priority - left.priority);

    for (const definition of candidates) {
      const variant = this.selectVariant(context, definition, platform, input.device);

      if (variant) {
        return this.toResolved(definition, variant, platform);
      }
    }

    throw new NotFoundException(`Metadata EXPERIENCE:${entityCode}:${platform} was not found.`);
  }

  previewExperience(
    definition: ExperienceDefinition,
    platform: ExperiencePlatform,
    context: RuntimeContext,
    device?: string,
  ): ResolvedExperience {
    const variant = this.selectVariant(context, definition, platform, device);

    if (!variant) {
      throw new NotFoundException(`Experience ${definition.code} has no ${platform} variant.`);
    }

    return this.toResolved(definition, variant, platform);
  }

  private selectVariant(
    context: RuntimeContext,
    definition: ExperienceDefinition,
    platform: ExperiencePlatform,
    device?: string,
  ): ExperienceVariantDefinition | undefined {
    return definition.variants
      .filter((variant) => variant.platform === platform)
      .filter((variant) => this.conditionsMatch(context, variant.conditions, platform, device))
      [0];
  }

  private toResolved(
    definition: ExperienceDefinition,
    variant: ExperienceVariantDefinition,
    platform: ExperiencePlatform,
  ): ResolvedExperience {
    return {
      selected: definition.code,
      entityCode: definition.entityCode,
      platform,
      page: variant.pageCode,
      template: variant.templateCode,
      navigation: variant.navigationCode,
      theme: variant.themeCode,
      layout: variant.layoutMode,
      interaction: variant.interaction,
    };
  }

  private conditionsMatch(
    context: RuntimeContext,
    conditions: ExperienceConditions | undefined,
    platform: ExperiencePlatform,
    device?: string,
  ): boolean {
    if (!conditions) {
      return true;
    }

    if (conditions.platform && conditions.platform !== platform) {
      return false;
    }

    if (conditions.device && conditions.device !== device) {
      return false;
    }

    if (conditions.role && !(context.roles ?? []).includes(conditions.role)) {
      return false;
    }

    if (conditions.roles?.length && !conditions.roles.every((role) => (context.roles ?? []).includes(role))) {
      return false;
    }

    if (conditions.attribute && context.attributes?.[conditions.attribute.key] !== conditions.attribute.value) {
      return false;
    }

    return Object.entries(conditions.attributes ?? {}).every(([key, value]) => context.attributes?.[key] === value);
  }
}
