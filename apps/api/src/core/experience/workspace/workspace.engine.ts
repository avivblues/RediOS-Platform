import { Inject, Injectable } from '@nestjs/common';
import type { ExperiencePlatform, ResolvedPersona, ResolvedWorkspace, RuntimeContext, WorkspaceDefinition } from '@redios/shared';
import { hasAnyPersonaCapability } from '@redios/shared';
import { METADATA_PROVIDER, type MetadataProvider } from '../../metadata/metadata-provider.interface';
import { workspaceCodeForPersona, workspaceForPersona } from './workspace.definitions';

@Injectable()
export class WorkspaceEngine {
  constructor(@Inject(METADATA_PROVIDER) private readonly metadataProvider: MetadataProvider) {}

  async resolve(
    context: RuntimeContext,
    persona: ResolvedPersona,
    platform: ExperiencePlatform = 'WEB',
  ): Promise<ResolvedWorkspace> {
    const workspaceCode = workspaceCodeForPersona(persona.persona, platform);
    const metadata = await this.metadataProvider.findOne(context, {
      type: 'WORKSPACE',
      code: workspaceCode,
      allApplications: true,
      enabledOnly: true,
    });

    const definition = (metadata?.definition as WorkspaceDefinition | undefined) ?? workspaceForPersona(persona.persona, platform);
    return this.toResolved(definition, persona.capabilities);
  }

  private toResolved(definition: WorkspaceDefinition, capabilities: string[]): ResolvedWorkspace {
    const panels = [...definition.panels]
      .filter((panel) => hasAnyPersonaCapability(capabilities, panel.requiredCapabilities))
      .sort((left, right) => left.order - right.order);

    return {
      code: definition.code,
      persona: definition.persona,
      title: definition.title,
      subtitle: definition.subtitle,
      panels,
    };
  }
}
