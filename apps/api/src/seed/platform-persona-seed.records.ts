import type { MetadataDefinition, PersonaMetadataDefinition } from '@redios/shared';
import { fallbackPersonaDefinition } from '../core/experience/persona/persona.policy';
import { WORKSPACE_DEFINITIONS } from '../core/experience/workspace/workspace.definitions';

const tenantId = 'demo';
const domainCode = 'DEFAULT';
const applicationCode = 'REDIOS_PLATFORM';

const personas: PersonaMetadataDefinition['persona'][] = ['SYSTEM_ADMIN', 'PROGRAMMER', 'MANAGER', 'STAFF'];

export const platformPersonaSeedRecords: MetadataDefinition<PersonaMetadataDefinition>[] = personas.map((persona) => {
  const definition = fallbackPersonaDefinition(persona);
  const workspace = WORKSPACE_DEFINITIONS.find((item) => item.persona === persona && item.platform !== 'MOBILE');

  return {
    tenantId,
    domainCode,
    applicationCode,
    type: 'PERSONA',
    code: persona,
    name: definition.label,
    version: 1,
    enabled: true,
    definition: {
      ...definition,
      workspaceCode: workspace?.code ?? definition.workspaceCode,
    },
  };
});
