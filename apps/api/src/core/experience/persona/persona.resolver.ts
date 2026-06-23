import { Inject, Injectable } from '@nestjs/common';
import type { PersonaMetadataDefinition, PlatformPersona, ResolvedPersona, RuntimeContext } from '@redios/shared';
import { METADATA_PROVIDER, type MetadataProvider } from '../../metadata/metadata-provider.interface';
import { PersonaCapabilityService } from './persona-capability.service';
import { buildResolvedPersona, fallbackPersonaDefinition, resolvePlatformPersona } from './persona.policy';

@Injectable()
export class PersonaResolver {
  constructor(
    @Inject(METADATA_PROVIDER) private readonly metadataProvider: MetadataProvider,
    private readonly personaCapabilityService: PersonaCapabilityService,
  ) {}

  async resolve(context: RuntimeContext): Promise<ResolvedPersona> {
    const persona = resolvePlatformPersona(context.roles ?? []);
    const definition = await this.loadPersonaMetadata(context, persona);
    const capabilities = this.personaCapabilityService.resolveFromMetadata(
      persona,
      definition.capabilities,
      context,
    );

    return buildResolvedPersona(context.roles ?? [], definition, capabilities);
  }

  private async loadPersonaMetadata(context: RuntimeContext, persona: PlatformPersona): Promise<PersonaMetadataDefinition> {
    const records = await this.metadataProvider.findMetadata(context, {
      type: 'PERSONA',
      code: persona,
      allApplications: true,
      enabledOnly: true,
    });

    const metadata = records.find((record) => record.type === 'PERSONA' && record.code === persona);
    if (metadata?.definition) {
      return metadata.definition as PersonaMetadataDefinition;
    }

    return fallbackPersonaDefinition(persona);
  }
}
