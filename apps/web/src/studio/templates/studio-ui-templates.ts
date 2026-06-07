export interface StudioUiTemplate {
  code: string;
  name: string;
  description: string;
  layout: 'CARD' | 'DASHBOARD' | 'LIST_DETAIL' | 'FORM_WORKSPACE' | 'BUILDER';
  tokens: {
    color: string;
    radius: string;
    spacing: string;
    density: string;
  };
}

export const studioUiTemplates: StudioUiTemplate[] = [
  {
    code: 'MODERN_ADMIN_TEMPLATE',
    name: 'Modern Admin',
    description: 'Enterprise SaaS shell with cards, rounded corners, and responsive spacing.',
    layout: 'CARD',
    tokens: { color: 'primary', radius: 'large', spacing: 'lg', density: 'normal' },
  },
  {
    code: 'DASHBOARD_TEMPLATE',
    name: 'Dashboard',
    description: 'Summary cards, key metrics, and action panels for application home pages.',
    layout: 'DASHBOARD',
    tokens: { color: 'primary', radius: 'large', spacing: 'lg', density: 'normal' },
  },
  {
    code: 'LIST_DETAIL_TEMPLATE',
    name: 'List Detail',
    description: 'Responsive list and detail workspace for record management.',
    layout: 'LIST_DETAIL',
    tokens: { color: 'primary', radius: 'medium', spacing: 'md', density: 'normal' },
  },
  {
    code: 'FORM_WORKSPACE_TEMPLATE',
    name: 'Form Workspace',
    description: 'Card-based form layout for editing business records.',
    layout: 'FORM_WORKSPACE',
    tokens: { color: 'primary', radius: 'medium', spacing: 'md', density: 'comfortable' },
  },
  {
    code: 'BUILDER_TEMPLATE',
    name: 'Builder',
    description: 'Three-panel builder layout with components, canvas, and properties.',
    layout: 'BUILDER',
    tokens: { color: 'primary', radius: 'large', spacing: 'lg', density: 'comfortable' },
  },
];
