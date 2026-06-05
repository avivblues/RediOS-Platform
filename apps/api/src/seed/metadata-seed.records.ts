import type {
  ActionDefinition,
  ApplicationDefinition,
  EntityDefinition,
  FieldDefinition,
  MetadataDefinition,
} from '@redios/shared';

const tenantId = '1';
const domainCode = '1.26.1.0';
const applicationCode = 'MAINTENANCE';
const entityCode = 'ASSET';

export const metadataSeedRecords: MetadataDefinition[] = [
  {
    tenantId,
    domainCode,
    applicationCode,
    type: 'APPLICATION',
    code: applicationCode,
    name: 'Maintenance',
    version: 1,
    enabled: true,
    definition: {
      code: applicationCode,
      name: 'Maintenance',
      capabilities: [],
      entityCodes: [entityCode],
      enabled: true,
    } satisfies ApplicationDefinition,
  },
  {
    tenantId,
    domainCode,
    applicationCode,
    type: 'ENTITY',
    code: entityCode,
    name: 'Asset',
    version: 1,
    enabled: true,
    definition: {
      code: entityCode,
      name: 'Asset',
      type: 'MASTER',
      fieldCodes: ['assetName', 'serialNo', 'location', 'status'],
      actionCodes: ['CREATE', 'UPDATE'],
      enabled: true,
    } satisfies EntityDefinition,
  },
  ...['assetName', 'serialNo', 'location', 'status'].map(
    (fieldCode): MetadataDefinition<FieldDefinition> => ({
      tenantId,
      domainCode,
      applicationCode,
      type: 'FIELD',
      code: fieldCode,
      name: fieldCode,
      version: 1,
      enabled: true,
      definition: {
        code: fieldCode,
        name: fieldCode,
        entityCode,
        dataType: 'string',
        required: fieldCode === 'assetName',
        visible: true,
        readonly: false,
      },
    }),
  ),
  ...['CREATE', 'UPDATE'].map(
    (actionCode): MetadataDefinition<ActionDefinition> => ({
      tenantId,
      domainCode,
      applicationCode,
      type: 'ACTION',
      code: actionCode,
      name: actionCode,
      version: 1,
      enabled: true,
      definition: {
        code: actionCode,
        name: actionCode,
        entityCode,
        enabled: true,
      },
    }),
  ),
];
