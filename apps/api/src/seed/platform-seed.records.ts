import type {
  CapabilityDefinition,
  PlatformApplication,
  PlatformRole,
  PlatformTenant,
  PlatformUser,
} from '@redios/shared';
import { hashPlatformPassword } from '../platform/password.util';

export const DEFAULT_TENANT_ID = 'demo';
export const DEFAULT_TENANT_CODE = 'DEFAULT';
export const SYSTEM_ADMIN_USER_ID = 'user_system_admin';

export const platformTenantSeed: PlatformTenant = {
  id: DEFAULT_TENANT_ID,
  code: DEFAULT_TENANT_CODE,
  name: 'Default Tenant',
  status: 'ACTIVE',
};

export const platformUserSeed: PlatformUser = {
  id: SYSTEM_ADMIN_USER_ID,
  tenantId: DEFAULT_TENANT_ID,
  email: 'admin@redios.local',
  passwordHash: hashPlatformPassword('admin123'),
  displayName: 'System Administrator',
  status: 'ACTIVE',
  roleCodes: ['SYSTEM_ADMIN'],
};

export const platformRoleSeeds: PlatformRole[] = [
  {
    code: 'SYSTEM_ADMIN',
    name: 'System Administrator',
    purpose: 'Full platform control',
    permissions: ['*'],
  },
  {
    code: 'SYSTEM_ANALYST',
    name: 'System Analyst',
    purpose: 'Build application metadata',
    permissions: ['metadata.*', 'builder.*', 'workflow.*', 'automation.*'],
  },
  {
    code: 'POWER_USER',
    name: 'Power User',
    purpose: 'Customize existing application',
    permissions: ['form.customize', 'field.create', 'layout.change'],
  },
  {
    code: 'BUSINESS_USER',
    name: 'Business User',
    purpose: 'Use application only',
    permissions: ['runtime.access'],
  },
];

export const platformApplicationSeeds: PlatformApplication[] = [
  {
    code: 'REDIOS_STUDIO',
    name: 'RediOS Studio',
    type: 'SYSTEM',
    status: 'ACTIVE',
    features: [
      'Metadata Designer',
      'Form Builder',
      'Workflow Designer',
      'Capability Explorer',
    ],
  },
  {
    code: 'REDIOS_ADMIN',
    name: 'RediOS Admin',
    type: 'SYSTEM',
    status: 'ACTIVE',
    features: ['User Management', 'Role Management', 'Tenant Management'],
  },
];

const emptySchema = { type: 'object', properties: {} };

function capability(
  code: string,
  name: string,
  module: CapabilityDefinition['module'],
  description?: string,
  permissions: string[] = [],
): CapabilityDefinition {
  return {
    code,
    name,
    module,
    inputSchema: emptySchema,
    outputSchema: emptySchema,
    description,
    implementationStatus: 'CONTRACT',
    handlerRef: `${module.toLowerCase()}.${code.split('.').slice(1).join('.').toLowerCase()}`,
    permissions,
  };
}

export const capabilitySeedRecords: CapabilityDefinition[] = [
  capability('IDENTITY.LOGIN', 'Login', 'IDENTITY', 'Authenticate user session'),
  capability('IDENTITY.LOGOUT', 'Logout', 'IDENTITY', 'Terminate user session'),
  capability('USER.CREATE', 'Create User', 'IDENTITY', 'Create domain user record', ['*']),
  capability('USER.UPDATE', 'Update User', 'IDENTITY', 'Update domain user record', ['*']),
  capability('TENANT.CREATE', 'Create Tenant', 'TENANT', 'Provision tenant domain record', ['*']),
  capability('TENANT.UPDATE', 'Update Tenant', 'TENANT', 'Update tenant domain record', ['*']),
  capability('METADATA.PUBLISH', 'Publish Metadata', 'METADATA', 'Publish application metadata package', ['metadata.*']),
  capability('METADATA.VERSION', 'Metadata Version', 'METADATA', 'Resolve metadata version', ['metadata.*']),
  capability('FORM.SAVE', 'Save Form', 'BUILDER', 'Persist form layout metadata', ['builder.*']),
  capability('FORM.PREVIEW', 'Preview Form', 'BUILDER', 'Preview form layout metadata', ['builder.*']),
  capability('PRODUCT.CREATE', 'Create Product', 'INVENTORY', 'Create inventory product domain record'),
  capability('PRODUCT.UPDATE', 'Update Product', 'INVENTORY', 'Update inventory product domain record'),
  capability('STOCK.RECEIVE', 'Receive Stock', 'INVENTORY', 'Receive stock into warehouse'),
  capability('STOCK.ISSUE', 'Issue Stock', 'INVENTORY', 'Issue stock from warehouse'),
  capability('ACCOUNT.CREATE', 'Create GL Account', 'FINANCE', 'Create chart of account record'),
  capability('JOURNAL.CREATE', 'Create Journal', 'FINANCE', 'Create journal header and lines'),
  capability('JOURNAL.POST', 'Post Journal', 'FINANCE', 'Post journal to general ledger'),
  capability('BALANCE.GET', 'Get Balance', 'FINANCE', 'Resolve account balance from finance engine'),
  {
    code: 'FINANCE.TRIAL_BALANCE',
    name: 'Trial Balance Query',
    module: 'FINANCE',
    inputSchema: {
      type: 'object',
      properties: {
        period: { type: 'string' },
        company: { type: 'string' },
      },
      required: ['period', 'company'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        rows: { type: 'array' },
      },
    },
    description: 'Query capability consumed by Query Builder. Finance engine prepares output.',
    implementationStatus: 'CONTRACT',
    handlerRef: 'finance.trial_balance',
  },
];
