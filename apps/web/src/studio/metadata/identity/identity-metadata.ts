import type { CanvasComponent } from '../../builder/types';
import type {
  StudioActionDraft,
  StudioApplicationDraft,
  StudioApplicationMetadataPackage,
  StudioDataAttribute,
  StudioDataObject,
  StudioMenuDraft,
  StudioQueryDraft,
  StudioScreenDraft,
  StudioSecurityDraft,
} from '../metadata-store';

export const REDIOS_ADMIN_APPLICATION: StudioApplicationDraft = {
  code: 'REDIOS_ADMIN',
  name: 'REDIOS ADMIN',
  slug: 'redios-admin',
  template: 'SYSTEM_IDENTITY',
  target: 'web',
  createdAt: '2026-06-15T00:00:00.000Z',
};

const userSystemFields: StudioDataAttribute[] = [
  { name: 'id', label: 'ID', type: 'uuid', primary: true, locked: true, editable: false, systemField: true, position: 10 },
  { name: 'email', label: 'Email', type: 'email', unique: true, required: true, locked: true, systemField: true, position: 20 },
  { name: 'username', label: 'Username', type: 'string', unique: true, locked: true, systemField: true, position: 30 },
  { name: 'passwordHash', label: 'Password', type: 'password', secure: true, hidden: true, locked: true, systemField: true, position: 40 },
  { name: 'displayName', label: 'Display Name', type: 'string', position: 50 },
  { name: 'status', label: 'Status', type: 'enum', values: ['ACTIVE', 'INACTIVE', 'LOCKED'], position: 60 },
  { name: 'createdAt', label: 'Created At', type: 'datetime', locked: true, editable: false, systemField: true, position: 70 },
  { name: 'createdBy', label: 'Created By', type: 'string', locked: true, editable: false, systemField: true, position: 80 },
  { name: 'updatedAt', label: 'Updated At', type: 'datetime', locked: true, editable: false, systemField: true, position: 90 },
  { name: 'updatedBy', label: 'Updated By', type: 'string', locked: true, editable: false, systemField: true, position: 100 },
];

export const userSystemObject: StudioDataObject = {
  name: 'USER',
  objectCode: 'USER',
  type: 'SYSTEM_OBJECT',
  owner: 'REDIOS',
  locked: true,
  upgradeSafe: true,
  attributes: userSystemFields,
};

export const rediosAdminActions: StudioActionDraft[] = [
  { code: 'AUTH.LOGIN', label: 'Login', trigger: 'onSubmit', steps: ['validate', 'identity AUTH.LOGIN', 'create session', 'load permission', 'redirect'] },
  { code: 'USER.REGISTER', label: 'Register User', trigger: 'onSubmit', steps: ['validate', 'identity USER.REGISTER', 'notify'] },
  { code: 'USER.CREATE', label: 'Create User', trigger: 'onClick', steps: ['validate', 'identity USER.CREATE', 'notify'] },
  { code: 'USER.UPDATE', label: 'Update User', trigger: 'onClick', steps: ['validate', 'identity USER.UPDATE', 'notify'] },
  { code: 'USER.DISABLE', label: 'Disable User', trigger: 'onClick', steps: ['confirm', 'identity USER.DISABLE', 'notify'] },
  { code: 'USER.DELETE', label: 'Delete User', trigger: 'onClick', steps: ['confirm', 'identity USER.DELETE', 'notify'] },
  { code: 'USER.LIST', label: 'List Users', trigger: 'onLoad', steps: ['identity USER.LIST'] },
  { code: 'USER.GET', label: 'Get User', trigger: 'onLoad', steps: ['identity USER.GET'] },
];

export const rediosAdminQueries: StudioQueryDraft[] = [
  {
    code: 'USER.LIST',
    label: 'User List',
    objectName: 'USER',
    fields: ['username', 'email', 'displayName', 'status'],
    sourceObjects: ['USER'],
    columns: [
      { objectName: 'USER', field: 'username', alias: 'Username', visible: true, sortType: 'ascending', sortOrder: 1, aggregate: 'none', grouping: false, criteria: '', operator: 'and' },
      { objectName: 'USER', field: 'email', alias: 'Email', visible: true, sortType: 'none', aggregate: 'none', grouping: false, criteria: '', operator: 'and' },
      { objectName: 'USER', field: 'displayName', alias: 'Display Name', visible: true, sortType: 'none', aggregate: 'none', grouping: false, criteria: '', operator: 'and' },
      { objectName: 'USER', field: 'status', alias: 'Status', visible: true, sortType: 'none', aggregate: 'none', grouping: false, criteria: "!= 'DELETED'", operator: 'and' },
    ],
    filter: 'status != DELETED',
    sort: 'username asc',
    distinct: false,
    limit: 100,
    offset: 0,
    mode: 'list',
    sqlPreview: "SELECT USER.username AS Username, USER.email AS Email, USER.displayName AS Display_Name, USER.status AS Status\nFROM USER\nWHERE USER.status != 'DELETED'\nORDER BY USER.username ASC\nLIMIT 100",
  },
];

export const rediosAdminMenu: StudioMenuDraft[] = [
  { id: 'security', label: 'Security', route: '/security', screen: 'USER_LIST', permission: 'security.view' },
  { id: 'security-users', label: 'Users', route: '/security/users', screen: 'USER_LIST', permission: 'user.view', parent: 'security' },
  { id: 'security-roles', label: 'Roles', route: '/security/roles', screen: 'REDIOS_ROLES', permission: 'role.view', parent: 'security' },
  { id: 'security-permission', label: 'Permission', route: '/security/permission', screen: 'REDIOS_PERMISSION', permission: 'permission.view', parent: 'security' },
];

export const rediosAdminScreens: StudioScreenDraft[] = [
  { code: 'LOGIN_FORM', label: 'Login Form', objectName: 'USER', mode: 'create', target: 'web', updatedAt: '2026-06-15T00:00:00.000Z' },
  { code: 'REGISTER_FORM', label: 'Register User Form', objectName: 'USER', mode: 'create', target: 'web', updatedAt: '2026-06-15T00:00:00.000Z' },
  { code: 'USER_FORM', label: 'User Create Form', objectName: 'USER', mode: 'create', target: 'web', updatedAt: '2026-06-15T00:00:00.000Z' },
  { code: 'USER_EDIT_FORM', label: 'User Edit Form', objectName: 'USER', mode: 'edit', target: 'web', updatedAt: '2026-06-15T00:00:00.000Z' },
  { code: 'USER_DETAIL', label: 'User Detail View', objectName: 'USER', mode: 'detail', target: 'web', updatedAt: '2026-06-15T00:00:00.000Z' },
  { code: 'USER_LIST', label: 'User List View', objectName: 'USER', mode: 'table', target: 'web', updatedAt: '2026-06-15T00:00:00.000Z' },
  { code: 'REDIOS_ROLES', label: 'Roles', mode: 'table', target: 'web', updatedAt: '2026-06-15T00:00:00.000Z' },
  { code: 'REDIOS_PERMISSION', label: 'Permission', mode: 'table', target: 'web', updatedAt: '2026-06-15T00:00:00.000Z' },
];

export const rediosAdminSecurity: StudioSecurityDraft = {
  roles: [
    {
      code: 'ADMIN',
      label: 'RediOS Administrator',
      permissions: ['*', 'security.view', 'user.view', 'user.create', 'user.update', 'user.disable'],
      fieldAccess: {},
      actionAccess: ['AUTH.LOGIN', 'USER.REGISTER', 'USER.CREATE', 'USER.UPDATE', 'USER.DISABLE', 'USER.DELETE', 'USER.LIST', 'USER.GET'],
      powerUser: true,
    },
  ],
};

export const rediosAdminScreenCanvases: Record<string, CanvasComponent[]> = {
  LOGIN_FORM: [
    form('login_form', 'Login Form', 420, [
      field('login_email', 'EmailInput', 'Email', 'email', 0, 0, 12),
      field('login_password', 'PasswordInput', 'Password', 'passwordHash', 0, 1, 12),
      button('login_button', 'Login', 'AUTH.LOGIN', 0, 2, 12),
    ]),
  ],
  REGISTER_FORM: [
    form('register_form', 'Register User Form', 480, [
      field('register_email', 'EmailInput', 'Email', 'email', 0, 0, 12),
      field('register_username', 'TextInput', 'Username', 'username', 0, 1, 12),
      field('register_password', 'PasswordInput', 'Password', 'passwordHash', 0, 2, 12),
      button('register_button', 'Register User', 'USER.REGISTER', 0, 3, 12),
    ]),
  ],
  USER_FORM: [
    form('user_create_form', 'User Create Form', 520, [
      field('user_email', 'EmailInput', 'Email', 'email', 0, 0),
      field('user_username', 'TextInput', 'Username', 'username', 6, 1),
      field('user_display_name', 'TextInput', 'Display Name', 'displayName', 0, 2),
      field('user_password', 'PasswordInput', 'Password', 'passwordHash', 6, 3),
      field('user_status', 'Dropdown', 'Status', 'status', 0, 4),
      button('save_user', 'Save User', 'USER.CREATE', 0, 5, 4),
    ]),
  ],
  USER_EDIT_FORM: [
    form('user_edit_form', 'User Edit Form', 580, [
      field('edit_user_id', 'TextInput', 'ID', 'id', 0, 0, 6, true),
      field('edit_user_email', 'EmailInput', 'Email', 'email', 6, 1, 6, true),
      field('edit_user_username', 'TextInput', 'Username', 'username', 0, 2, 6, true),
      field('edit_user_display_name', 'TextInput', 'Display Name', 'displayName', 6, 3),
      field('edit_user_status', 'Dropdown', 'Status', 'status', 0, 4),
      button('update_user', 'Save User', 'USER.UPDATE', 0, 5, 4),
    ]),
  ],
  USER_DETAIL: [
    form('user_detail_form', 'User Detail View', 560, [
      field('detail_user_id', 'TextInput', 'ID', 'id', 0, 0, 6, true),
      field('detail_user_email', 'EmailInput', 'Email', 'email', 6, 1, 6, true),
      field('detail_user_username', 'TextInput', 'Username', 'username', 0, 2, 6, true),
      field('detail_user_display_name', 'TextInput', 'Display Name', 'displayName', 6, 3, 6, true),
      field('detail_user_status', 'Dropdown', 'Status', 'status', 0, 4, 6, true),
    ]),
  ],
  USER_LIST: [
    {
      id: 'user_list_table',
      type: 'DataTable',
      label: 'User List',
      width: 12,
      height: 320,
      x: 0,
      y: 0,
      binding: { object: 'USER', field: 'username' },
      template: {
        dataSource: { object: 'USER', query: 'USER.LIST' },
        columns: [
          { field: 'username', label: 'Username' },
          { field: 'email', label: 'Email' },
          { field: 'displayName', label: 'Display Name' },
          { field: 'status', label: 'Status' },
        ],
      },
    },
    button('open_user_create', 'Create User', 'OPEN.USER_FORM', 0, 1, 4),
    button('disable_user', 'Disable User', 'USER.DISABLE', 4, 2, 4),
  ],
  REDIOS_ROLES: [placeholder('roles_placeholder', 'Roles metadata will be generated from Security Designer.', 'ROLE')],
  REDIOS_PERMISSION: [placeholder('permission_placeholder', 'Permission metadata will be generated from Security Designer.', 'PERMISSION')],
};

export const rediosAdminSeedMetadata = {
  dataObjects: [userSystemObject],
  queries: rediosAdminQueries,
  actions: rediosAdminActions,
  connectors: [],
  customOrganisms: [],
  processes: [],
  menu: rediosAdminMenu,
  screens: rediosAdminScreens,
  security: rediosAdminSecurity,
};

export function rediosAdminPublishedPackage(): StudioApplicationMetadataPackage {
  return {
    appCode: REDIOS_ADMIN_APPLICATION.code,
    appSlug: REDIOS_ADMIN_APPLICATION.slug,
    appName: REDIOS_ADMIN_APPLICATION.name,
    target: REDIOS_ADMIN_APPLICATION.target,
    dataObjects: rediosAdminSystemObjectContracts(rediosAdminSeedMetadata.dataObjects),
    queries: rediosAdminQueries,
    actions: rediosAdminActions,
    connectors: [],
    processes: [],
    menu: rediosAdminMenu,
    screens: rediosAdminScreens,
    security: rediosAdminSecurity,
    customOrganisms: [],
    canvas: rediosAdminScreenCanvases.USER_LIST,
    screenCanvases: rediosAdminScreenCanvases,
    theme: {
      name: 'RediOS System',
      tokens: {
        primary: '#2563eb',
        surface: '#ffffff',
        background: '#eef3ff',
      },
    },
    publishedAt: new Date().toISOString(),
  };
}

export function rediosAdminSystemObjectContracts(dataObjects: StudioDataObject[]) {
  const currentUserObject = dataObjects.find((object) => object.name === 'USER' || object.objectCode === 'USER');
  const otherObjects = dataObjects.filter((object) => object !== currentUserObject);
  const mergedUserObject = mergeUserObject(currentUserObject);

  return [mergedUserObject, ...otherObjects];
}

function mergeUserObject(currentObject?: StudioDataObject): StudioDataObject {
  const currentAttributes = currentObject?.attributes ?? [];
  const systemFieldNames = new Set(userSystemFields.map((fieldItem) => fieldItem.name));
  const mergedSystemFields = userSystemFields.map((fieldItem) => {
    const currentField = currentAttributes.find((attribute) => attribute.name === fieldItem.name);

    return {
      ...fieldItem,
      label: currentField?.label ?? fieldItem.label,
      hidden: currentField?.hidden ?? fieldItem.hidden,
      position: currentField?.position ?? fieldItem.position,
    };
  });
  const customFields = currentAttributes
    .filter((attribute) => !systemFieldNames.has(attribute.name))
    .map((attribute, index) => ({
      ...attribute,
      locked: false,
      systemField: false,
      position: attribute.position ?? 1000 + index,
    }));

  return {
    ...userSystemObject,
    ...currentObject,
    name: 'USER',
    objectCode: 'USER',
    type: 'SYSTEM_OBJECT',
    owner: 'REDIOS',
    locked: true,
    upgradeSafe: true,
    attributes: [...mergedSystemFields, ...customFields].sort((left, right) => (left.position ?? 0) - (right.position ?? 0)),
  };
}

function form(id: string, label: string, height: number, children: CanvasComponent[]): CanvasComponent {
  return {
    id,
    type: 'Form',
    label,
    width: 12,
    height,
    x: 0,
    y: 0,
    children,
  };
}

function field(
  id: string,
  type: string,
  label: string,
  fieldName: string,
  x: number,
  y: number,
  width = 6,
  readonly = false,
): CanvasComponent {
  return {
    id,
    type,
    label,
    placeholder: `Enter ${label}`,
    readonly,
    width,
    height: 64,
    x,
    y,
    binding: { object: 'USER', field: fieldName },
  };
}

function button(id: string, label: string, actionCode: string, x: number, y: number, width = 4): CanvasComponent {
  return {
    id,
    type: 'Button',
    label,
    width,
    height: 56,
    x,
    y,
    events: { onClick: actionCode },
    confirmation: actionCode === 'USER.DISABLE' || actionCode === 'USER.DELETE'
      ? {
        enabled: true,
        title: `${label}?`,
        message: `Action ${actionCode} akan dijalankan lewat IdentityEngine metadata runtime.`,
        confirmLabel: label,
        cancelLabel: 'Cancel',
        onConfirmAction: actionCode,
      }
      : undefined,
  };
}

function placeholder(id: string, label: string, objectName: string): CanvasComponent {
  return {
    id,
    type: 'FormHeading',
    label,
    width: 12,
    height: 90,
    x: 0,
    y: 0,
    binding: { object: objectName, field: 'code' },
  };
}
