import type { MetadataDefinition, WorkspaceDefinition } from '@redios/shared';
import { WORKSPACE_DEFINITIONS } from '../core/experience/workspace/workspace.definitions';

const tenantId = 'demo';
const domainCode = 'DEFAULT';
const applicationCode = 'REDIOS_PLATFORM';

export const platformWorkspaceSeedRecords: MetadataDefinition<WorkspaceDefinition>[] = WORKSPACE_DEFINITIONS.map(
  (workspace) => ({
    tenantId,
    domainCode,
    applicationCode,
    type: 'WORKSPACE',
    code: workspace.code,
    name: workspace.title,
    version: 1,
    enabled: workspace.enabled ?? true,
    definition: workspace,
  }),
);
