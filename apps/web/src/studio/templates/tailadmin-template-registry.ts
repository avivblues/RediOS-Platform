import type { BuilderComponentDefinition, CanvasComponent, TemplateComponentKind } from '../builder/types';

export interface TailAdminInventoryItem {
  atomicLevel: 'atom' | 'molecule' | 'organism' | 'template';
  category: BuilderComponentDefinition['category'];
  dependency?: 'apexcharts' | 'dropzone' | 'flatpickr' | 'fullcalendar' | 'jvectormap';
  label: string;
  page?: string;
  type: string;
}

export interface TailAdminPageTemplate {
  code: string;
  description: string;
  label: string;
  components: CanvasComponent[];
}

const commonMetrics = [
  { label: 'Customers', value: '3,782', field: 'customers' },
  { label: 'Orders', value: '5,359', field: 'orders' },
  { label: 'Revenue', value: '$18,650', field: 'revenue' },
  { label: 'Growth', value: '11.2%', field: 'growth' },
];

const monthlyCategories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monthlySalesSeries = [{ name: 'Sales', data: [168, 385, 201, 298, 187, 195, 291, 110, 215, 390, 280, 112] }];
const lineChartSeries = [
  { name: 'Sales', data: [180, 190, 170, 160, 175, 165, 170, 205, 230, 210, 240, 235] },
  { name: 'Revenue', data: [40, 30, 50, 40, 55, 40, 70, 100, 110, 120, 150, 140] },
];

export const tailAdminInventory: TailAdminInventoryItem[] = [
  { atomicLevel: 'atom', category: 'Fields', label: 'Input Field', type: 'TextInput' },
  { atomicLevel: 'atom', category: 'Fields', label: 'Text Area', type: 'TextArea' },
  { atomicLevel: 'atom', category: 'Fields', label: 'Checkbox', type: 'Checkbox' },
  { atomicLevel: 'atom', category: 'Fields', label: 'Switch', type: 'ToggleSwitch' },
  { atomicLevel: 'atom', category: 'Static', label: 'Button', type: 'Button' },
  { atomicLevel: 'atom', category: 'Feedback', label: 'Badge', page: 'Badges', type: 'TemplateBadge' },
  { atomicLevel: 'atom', category: 'Feedback', label: 'Alert', page: 'Alerts', type: 'TemplateAlert' },
  { atomicLevel: 'atom', category: 'Media', label: 'Avatar', page: 'Avatars', type: 'TemplateAvatar' },
  { atomicLevel: 'atom', category: 'Media', label: 'Image', page: 'Images', type: 'TemplateImageCard' },
  { atomicLevel: 'atom', category: 'Media', label: 'Video', page: 'Videos', type: 'TemplateVideoCard' },
  { atomicLevel: 'molecule', category: 'Fields', dependency: 'flatpickr', label: 'Date Picker', page: 'Form Elements', type: 'DateInput' },
  { atomicLevel: 'molecule', category: 'Fields', label: 'Select', page: 'Form Elements', type: 'Dropdown' },
  { atomicLevel: 'molecule', category: 'Fields', label: 'Multi Select', page: 'Form Elements', type: 'Tags' },
  { atomicLevel: 'molecule', category: 'Fields', label: 'Phone Input', page: 'Form Elements', type: 'PhoneInput' },
  { atomicLevel: 'molecule', category: 'Fields', label: 'Input Group', page: 'Form Elements', type: 'TemplateInputGroup' },
  { atomicLevel: 'molecule', category: 'Fields', label: 'Phone Input Group', page: 'Form Elements', type: 'TemplatePhoneInputGroup' },
  { atomicLevel: 'molecule', category: 'Fields', label: 'Input States', page: 'Form Elements', type: 'TemplateInputState' },
  { atomicLevel: 'molecule', category: 'Fields', label: 'File Input', page: 'Form Elements', type: 'TemplateFileInput' },
  { atomicLevel: 'molecule', category: 'Fields', label: 'Textarea States', page: 'Form Elements', type: 'TemplateTextareaState' },
  { atomicLevel: 'molecule', category: 'Fields', label: 'Radio Group', page: 'Form Elements', type: 'TemplateRadioGroup' },
  { atomicLevel: 'molecule', category: 'Fields', label: 'Checkbox Group', page: 'Form Elements', type: 'TemplateCheckboxGroup' },
  { atomicLevel: 'molecule', category: 'Fields', label: 'Switch Group', page: 'Form Elements', type: 'TemplateSwitchGroup' },
  { atomicLevel: 'molecule', category: 'Fields', label: 'Select Group', page: 'Form Elements', type: 'TemplateSelectGroup' },
  { atomicLevel: 'molecule', category: 'Fields', dependency: 'flatpickr', label: 'TailAdmin Date Picker', page: 'Form Elements', type: 'TemplateDatePicker' },
  { atomicLevel: 'molecule', category: 'Feedback', label: 'Modal', type: 'Modal' },
  { atomicLevel: 'molecule', category: 'Navigation', label: 'Breadcrumb', type: 'TemplateBreadcrumb' },
  { atomicLevel: 'organism', category: 'Dashboard', label: 'Metric Card Group', page: 'Dashboard', type: 'TemplateMetricGroup' },
  { atomicLevel: 'organism', category: 'Charts', dependency: 'apexcharts', label: 'Monthly Sales Chart', page: 'Dashboard', type: 'TemplateChartPanel' },
  { atomicLevel: 'organism', category: 'Dashboard', dependency: 'jvectormap', label: 'Demographic Map', page: 'Dashboard', type: 'TemplateMapPanel' },
  { atomicLevel: 'organism', category: 'Data Display', label: 'Recent Orders Table', page: 'Dashboard', type: 'TemplateRecentOrders' },
  { atomicLevel: 'organism', category: 'Navigation', label: 'App Header', type: 'TemplateAppHeader' },
  { atomicLevel: 'organism', category: 'Navigation', label: 'App Sidebar', type: 'TemplateAppSidebar' },
  { atomicLevel: 'organism', category: 'Feedback', label: 'Notification Dropdown', type: 'TemplateNotificationList' },
  { atomicLevel: 'organism', category: 'Advanced', dependency: 'fullcalendar', label: 'Calendar Board', page: 'Calendar', type: 'TemplateCalendarBoard' },
  { atomicLevel: 'organism', category: 'Charts', dependency: 'apexcharts', label: 'Line Chart', page: 'Line Chart', type: 'TemplateLineChart' },
  { atomicLevel: 'organism', category: 'Charts', dependency: 'apexcharts', label: 'Bar Chart', page: 'Bar Chart', type: 'TemplateBarChart' },
  { atomicLevel: 'organism', category: 'Data Display', label: 'Basic Table', page: 'Basic Tables', type: 'TemplateBasicTable' },
  { atomicLevel: 'organism', category: 'Fields', dependency: 'dropzone', label: 'Dropzone Upload', page: 'Form Elements', type: 'TemplateDropzone' },
  { atomicLevel: 'organism', category: 'Advanced', label: 'User Profile Card', page: 'User Profile', type: 'TemplateProfileCard' },
  { atomicLevel: 'organism', category: 'Advanced', label: 'Sign In Form', page: 'Sign In', type: 'TemplateAuthForm' },
  { atomicLevel: 'organism', category: 'Advanced', label: 'Sign Up Form', page: 'Sign Up', type: 'TemplateAuthForm' },
  { atomicLevel: 'organism', category: 'Feedback', label: 'Error State', page: '404 Error', type: 'TemplateErrorState' },
  { atomicLevel: 'template', category: 'Page Templates', label: 'Dashboard Home', page: 'Dashboard', type: 'TailAdminDashboardPage' },
  { atomicLevel: 'template', category: 'Page Templates', label: 'Calendar Page', page: 'Calendar', type: 'TailAdminCalendarPage' },
  { atomicLevel: 'template', category: 'Page Templates', label: 'Profile Page', page: 'User Profile', type: 'TailAdminProfilePage' },
  { atomicLevel: 'template', category: 'Page Templates', label: 'Form Elements Page', page: 'Form Elements', type: 'TailAdminFormElementsPage' },
  { atomicLevel: 'template', category: 'Page Templates', label: 'Basic Tables Page', page: 'Basic Tables', type: 'TailAdminBasicTablesPage' },
  { atomicLevel: 'template', category: 'Page Templates', label: 'Alerts Page', page: 'Alerts', type: 'TailAdminAlertsPage' },
  { atomicLevel: 'template', category: 'Page Templates', label: 'Avatars Page', page: 'Avatars', type: 'TailAdminAvatarsPage' },
  { atomicLevel: 'template', category: 'Page Templates', label: 'Badges Page', page: 'Badges', type: 'TailAdminBadgesPage' },
  { atomicLevel: 'template', category: 'Page Templates', label: 'Buttons Page', page: 'Buttons', type: 'TailAdminButtonsPage' },
  { atomicLevel: 'template', category: 'Page Templates', label: 'Images Page', page: 'Images', type: 'TailAdminImagesPage' },
  { atomicLevel: 'template', category: 'Page Templates', label: 'Videos Page', page: 'Videos', type: 'TailAdminVideosPage' },
  { atomicLevel: 'template', category: 'Page Templates', label: 'Line Chart Page', page: 'Line Chart', type: 'TailAdminLineChartPage' },
  { atomicLevel: 'template', category: 'Page Templates', label: 'Bar Chart Page', page: 'Bar Chart', type: 'TailAdminBarChartPage' },
  { atomicLevel: 'template', category: 'Page Templates', label: 'Blank Page', page: 'Blank', type: 'TailAdminBlankPage' },
  { atomicLevel: 'template', category: 'Page Templates', label: 'Sign In Page', page: 'Sign In', type: 'TailAdminSignInPage' },
  { atomicLevel: 'template', category: 'Page Templates', label: 'Sign Up Page', page: 'Sign Up', type: 'TailAdminSignUpPage' },
  { atomicLevel: 'template', category: 'Page Templates', label: 'Not Found Page', page: '404 Error', type: 'TailAdminNotFoundPage' },
];

export const tailAdminBuilderComponents: BuilderComponentDefinition[] = [
  createDefinition('TemplateMetricGroup', 'Dashboard Metrics', 'ORGANISM', 'Dashboard', 'KPI cards driven by Data Object metrics.', 'dashboard', { data: true }, 12, 170, { metrics: commonMetrics }),
  createDefinition('TemplateChartPanel', 'Monthly Sales Chart', 'ORGANISM', 'Charts', 'Metadata-aware chart placeholder for line, area, bar, or radial chart.', 'chart', { chart: true, data: true, query: true }, 12, 300, {
    chart: {
      categories: monthlyCategories,
      kind: 'bar',
      metricField: 'sales',
      series: monthlySalesSeries,
      seriesField: 'month',
    },
  }),
  createDefinition('TemplateMapPanel', 'Demographic Map', 'ORGANISM', 'Dashboard', 'Geo distribution block with metadata-ready dataset.', 'dashboard', { data: true, query: true }),
  createDefinition('TemplateRecentOrders', 'Recent Orders Table', 'ORGANISM', 'Data Display', 'Recent records table with object columns and row actions.', 'table', { action: true, columns: true, data: true, query: true }),
  createDefinition('TemplateBasicTable', 'Basic Table', 'ORGANISM', 'Data Display', 'Production-style table from selected Data Object.', 'table', { action: true, columns: true, data: true, query: true }),
  createDefinition('TemplateCalendarBoard', 'Calendar Board', 'ORGANISM', 'Advanced', 'Calendar layout using object fields as event title/date.', 'calendar', { action: true, columns: true, data: true, query: true }),
  createDefinition('TemplateProfileCard', 'Profile Card', 'ORGANISM', 'Advanced', 'User/customer profile cards bound to metadata fields.', 'profile', { data: true, permission: true }),
  createDefinition('TemplateAuthForm', 'Auth Form', 'ORGANISM', 'Advanced', 'Sign in/up form that calls Action Metadata.', 'auth', { action: true, data: true, permission: true }),
  createDefinition('TemplateAlert', 'Alert', 'ATOM', 'Feedback', 'Status alert from validation, process, or action result.', 'feedback', { action: true, permission: true }, 6, 96),
  createDefinition('TemplateBadge', 'Badge', 'ATOM', 'Feedback', 'Status badge for table/profile/dashboard.', 'feedback', { data: true }, 3, 56),
  createDefinition('TemplateAvatar', 'Avatar', 'ATOM', 'Media', 'User avatar mapped to image field.', 'media', { data: true, media: true }, 3, 96),
  createDefinition('TemplateImageCard', 'Image Card', 'ATOM', 'Media', 'Image display card for product/profile/media pages.', 'media', { data: true, media: true }, 6, 180),
  createDefinition('TemplateVideoCard', 'Video Card', 'ATOM', 'Media', 'Video card placeholder with metadata media binding.', 'media', { data: true, media: true }, 6, 180),
  createDefinition('TemplateDropzone', 'Dropzone Upload', 'ORGANISM', 'Fields', 'File upload dropzone bound to file/image attributes.', 'form', { data: true, media: true }, 12, 180),
  createDefinition('TemplateAppHeader', 'App Header', 'ORGANISM', 'Navigation', 'Header with search, notifications, and user profile.', 'navigation', { action: true, permission: true }, 12, 96),
  createDefinition('TemplateAppSidebar', 'App Sidebar', 'ORGANISM', 'Navigation', 'Sidebar shell driven by Menu Metadata.', 'navigation', { permission: true }, 4, 260),
  createDefinition('TemplateNotificationList', 'Notification List', 'ORGANISM', 'Feedback', 'Notification dropdown/list bound to process or action output.', 'feedback', { action: true, data: true }, 6, 220),
  createDefinition('TemplateLineChart', 'Line Chart', 'ORGANISM', 'Charts', 'Line chart page organism.', 'chart', { chart: true, data: true, query: true }, 12, 340, {
    chart: {
      categories: monthlyCategories,
      kind: 'line',
      metricField: 'sales',
      series: lineChartSeries,
      seriesField: 'month',
    },
  }),
  createDefinition('TemplateBarChart', 'Bar Chart', 'ORGANISM', 'Charts', 'Bar chart page organism.', 'chart', { chart: true, data: true, query: true }, 12, 300, {
    chart: {
      categories: monthlyCategories,
      kind: 'bar',
      metricField: 'sales',
      series: monthlySalesSeries,
      seriesField: 'month',
    },
  }),
  createDefinition('TemplateErrorState', 'Error State', 'ORGANISM', 'Feedback', '404/500/maintenance state with recovery action.', 'error', { action: true, permission: true }, 12, 220),
  createDefinition('TemplateBreadcrumb', 'Breadcrumb', 'MOLECULE', 'Navigation', 'Breadcrumb path for runtime context.', 'navigation', { permission: true }, 12, 56),
  createDefinition('TemplateInputGroup', 'Input Group', 'MOLECULE', 'Fields', 'TailAdmin input group with leading icon and helper label.', 'form', { data: true }, 6, 104, { variant: 'email' }),
  createDefinition('TemplatePhoneInputGroup', 'Phone Input Group', 'MOLECULE', 'Fields', 'TailAdmin phone input group with country prefix selector.', 'form', { data: true }, 6, 104, { variant: 'phone' }),
  createDefinition('TemplateInputState', 'Input States', 'MOLECULE', 'Fields', 'TailAdmin success, error, disabled, and hint input states.', 'form', { data: true }, 6, 150, { variant: 'success' }),
  createDefinition('TemplateFileInput', 'File Input', 'MOLECULE', 'Fields', 'TailAdmin file input bound to file metadata.', 'form', { data: true, media: true }, 6, 104, { variant: 'file' }),
  createDefinition('TemplateTextareaState', 'Textarea States', 'MOLECULE', 'Fields', 'TailAdmin textarea with helper/error states.', 'form', { data: true }, 6, 150, { variant: 'default' }),
  createDefinition('TemplateRadioGroup', 'Radio Group', 'MOLECULE', 'Fields', 'TailAdmin radio option group.', 'form', { data: true }, 6, 128, { variant: 'radio' }),
  createDefinition('TemplateCheckboxGroup', 'Checkbox Group', 'MOLECULE', 'Fields', 'TailAdmin checkbox option group.', 'form', { data: true }, 6, 128, { variant: 'checkbox' }),
  createDefinition('TemplateSwitchGroup', 'Switch Group', 'MOLECULE', 'Fields', 'TailAdmin switch group with color/disabled variants.', 'form', { data: true }, 6, 128, { variant: 'switch' }),
  createDefinition('TemplateSelectGroup', 'Select Group', 'MOLECULE', 'Fields', 'TailAdmin select and multi-select group.', 'form', { data: true }, 6, 132, { variant: 'select' }),
  createDefinition('TemplateDatePicker', 'Date Picker', 'MOLECULE', 'Fields', 'TailAdmin date picker input with calendar affordance.', 'form', { data: true }, 6, 104, { variant: 'date' }),
];

export const tailAdminPageTemplates: TailAdminPageTemplate[] = [
  page('tailadmin_dashboard', 'Dashboard Home', 'Dashboard summary with metrics, chart, map, and recent records.', [
    component('dashboard_metrics', 'TemplateMetricGroup', 'Ecommerce Metrics', 12, 150, 0, 0, 'dashboard', { metrics: commonMetrics }),
    component('dashboard_sales', 'TemplateChartPanel', 'Monthly Sales', 8, 280, 0, 1, 'chart', { chart: { categories: monthlyCategories, kind: 'bar', metricField: 'revenue', series: monthlySalesSeries, seriesField: 'month' } }),
    component('dashboard_target', 'TemplateChartPanel', 'Monthly Target', 4, 280, 8, 2, 'chart', { chart: { categories: ['Target'], kind: 'radial', metricField: 'growth', series: [{ name: 'Progress', data: [75.55] }] } }),
    component('dashboard_map', 'TemplateMapPanel', 'Customer Demographic', 5, 280, 0, 3, 'dashboard'),
    component('dashboard_orders', 'TemplateRecentOrders', 'Recent Orders', 7, 280, 5, 4, 'table'),
  ]),
  page('tailadmin_calendar', 'Calendar Page', 'Calendar board for schedule, task, or event metadata.', [
    component('calendar_board', 'TemplateCalendarBoard', 'Business Calendar', 12, 420, 0, 0, 'calendar'),
  ]),
  page('tailadmin_profile', 'User Profile Page', 'Profile metadata cards for user/customer/vendor style screens.', [
    component('profile_meta', 'TemplateProfileCard', 'Profile Summary', 4, 220, 0, 0, 'profile', { variant: 'meta' }),
    component('profile_info', 'TemplateProfileCard', 'Personal Information', 8, 220, 4, 1, 'profile', { variant: 'info' }),
    component('profile_address', 'TemplateProfileCard', 'Address Information', 12, 180, 0, 2, 'profile', { variant: 'address' }),
  ]),
  page('tailadmin_forms', 'Form Elements Page', 'Form element showcase as metadata-aware inputs.', [
    formElement('form_text', 'TextInput', 'Text Input', 0, 0),
    component('form_input_group', 'TemplateInputGroup', 'Email Input Group', 6, 104, 6, 1, 'form', { variant: 'email' }),
    component('form_phone_group', 'TemplatePhoneInputGroup', 'Phone Input Group', 6, 104, 0, 2, 'form', { variant: 'phone' }),
    component('form_state', 'TemplateInputState', 'Input States', 6, 150, 6, 3, 'form', { variant: 'success' }),
    component('form_select_group', 'TemplateSelectGroup', 'Select Inputs', 6, 132, 0, 4, 'form', { variant: 'select' }),
    component('form_date', 'TemplateDatePicker', 'Date Picker', 6, 104, 6, 5, 'form', { variant: 'date' }),
    component('form_textarea', 'TemplateTextareaState', 'Textarea States', 6, 150, 0, 6, 'form', { variant: 'default' }),
    component('form_file', 'TemplateFileInput', 'File Input', 6, 104, 6, 7, 'form', { variant: 'file' }),
    component('form_checkboxes', 'TemplateCheckboxGroup', 'Checkboxes', 6, 128, 0, 8, 'form', { variant: 'checkbox' }),
    component('form_radios', 'TemplateRadioGroup', 'Radio Buttons', 6, 128, 6, 9, 'form', { variant: 'radio' }),
    component('form_switches', 'TemplateSwitchGroup', 'Toggle Switches', 6, 128, 0, 10, 'form', { variant: 'switch' }),
    component('form_dropzone', 'TemplateDropzone', 'Dropzone Upload', 12, 180, 0, 11, 'form'),
  ]),
  page('tailadmin_tables', 'Basic Tables Page', 'Table page with metadata-driven columns and row actions.', [
    component('basic_table', 'TemplateBasicTable', 'Basic Table', 12, 340, 0, 0, 'table'),
  ]),
  page('tailadmin_alerts', 'Alerts Page', 'Alert variants for action/process feedback.', [
    component('alert_success', 'TemplateAlert', 'Success Alert', 6, 96, 0, 0, 'feedback', { variant: 'success' }),
    component('alert_warning', 'TemplateAlert', 'Warning Alert', 6, 96, 6, 1, 'feedback', { variant: 'warning' }),
    component('alert_error', 'TemplateAlert', 'Error Alert', 6, 96, 0, 2, 'feedback', { variant: 'error' }),
    component('alert_info', 'TemplateAlert', 'Info Alert', 6, 96, 6, 3, 'feedback', { variant: 'info' }),
  ]),
  page('tailadmin_avatars', 'Avatars Page', 'Avatar gallery for user or contact image fields.', [
    component('avatar_stack', 'TemplateAvatar', 'Avatar Stack', 4, 120, 0, 0, 'media', { variant: 'stack' }),
    component('avatar_profile', 'TemplateAvatar', 'Profile Avatar', 4, 120, 4, 1, 'media', { variant: 'profile' }),
    component('avatar_group', 'TemplateAvatar', 'Group Avatar', 4, 120, 8, 2, 'media', { variant: 'group' }),
  ]),
  page('tailadmin_badges', 'Badges Page', 'Badge gallery for statuses and classifications.', [
    component('badge_success', 'TemplateBadge', 'Active Badge', 3, 64, 0, 0, 'feedback', { variant: 'success' }),
    component('badge_warning', 'TemplateBadge', 'Pending Badge', 3, 64, 3, 1, 'feedback', { variant: 'warning' }),
    component('badge_error', 'TemplateBadge', 'Blocked Badge', 3, 64, 6, 2, 'feedback', { variant: 'error' }),
    component('badge_info', 'TemplateBadge', 'Info Badge', 3, 64, 9, 3, 'feedback', { variant: 'info' }),
  ]),
  page('tailadmin_buttons', 'Buttons Page', 'Button variants wired to Action Metadata.', [
    button('button_primary', 'Primary Action', 0, 0),
    button('button_secondary', 'Secondary Action', 3, 1),
    button('button_danger', 'Danger Action', 6, 2),
    button('button_outline', 'Outline Action', 9, 3),
  ]),
  page('tailadmin_images', 'Images Page', 'Image cards for media-driven screens.', [
    component('image_card_1', 'TemplateImageCard', 'Product Image', 6, 190, 0, 0, 'media'),
    component('image_card_2', 'TemplateImageCard', 'Gallery Image', 6, 190, 6, 1, 'media'),
  ]),
  page('tailadmin_videos', 'Videos Page', 'Video cards for training, documentation, or product media.', [
    component('video_card_1', 'TemplateVideoCard', 'Training Video', 6, 190, 0, 0, 'media'),
    component('video_card_2', 'TemplateVideoCard', 'Product Video', 6, 190, 6, 1, 'media'),
  ]),
  page('tailadmin_line_chart', 'Line Chart Page', 'Line chart page connected to Query/Field metadata.', [
    component('line_chart', 'TemplateLineChart', 'Line Chart', 12, 360, 0, 0, 'chart', { chart: { categories: monthlyCategories, kind: 'line', metricField: 'value', series: lineChartSeries, seriesField: 'period' } }),
  ]),
  page('tailadmin_bar_chart', 'Bar Chart Page', 'Bar chart page connected to Query/Field metadata.', [
    component('bar_chart', 'TemplateBarChart', 'Bar Chart', 12, 360, 0, 0, 'chart', { chart: { categories: monthlyCategories, kind: 'bar', metricField: 'value', series: monthlySalesSeries, seriesField: 'category' } }),
  ]),
  page('tailadmin_blank', 'Blank Page', 'Blank dashboard shell page for custom composition.', [
    component('blank_header', 'FormHeading', 'Blank Page', 12, 64, 0, 0, 'blank'),
    component('blank_card', 'TemplateMetricGroup', 'Start Building', 12, 150, 0, 1, 'blank', { metrics: [{ label: 'Ready', value: '1', field: 'ready' }] }),
  ]),
  page('tailadmin_signin', 'Sign In Page', 'Authentication form connected to Action Metadata.', [
    component('signin_form', 'TemplateAuthForm', 'Sign In', 6, 360, 3, 0, 'auth', { variant: 'signin' }),
  ]),
  page('tailadmin_signup', 'Sign Up Page', 'Registration form connected to Action Metadata.', [
    component('signup_form', 'TemplateAuthForm', 'Sign Up', 6, 420, 3, 0, 'auth', { variant: 'signup' }),
  ]),
  page('tailadmin_not_found', 'Not Found Page', '404 page with recovery action binding.', [
    component('not_found', 'TemplateErrorState', '404 Not Found', 12, 260, 0, 0, 'error', { variant: '404' }),
  ]),
];

export function tailAdminTemplateByCode(code: string) {
  return tailAdminPageTemplates.find((template) => template.code === code);
}

function createDefinition(
  type: string,
  label: string,
  layer: BuilderComponentDefinition['layer'],
  category: BuilderComponentDefinition['category'],
  description: string,
  templateKind: TemplateComponentKind,
  metadataCapabilities: BuilderComponentDefinition['metadataCapabilities'],
  width = 12,
  height = 240,
  defaultConfig: Partial<NonNullable<BuilderComponentDefinition['defaultConfig']>> = {},
): BuilderComponentDefinition {
  return {
    category,
    defaultConfig: { templateKind, ...defaultConfig },
    defaultSize: { height, width },
    description,
    label,
    layer,
    metadataCapabilities,
    type,
  };
}

function page(code: string, label: string, description: string, components: CanvasComponent[]): TailAdminPageTemplate {
  return { code, components, description, label };
}

function component(
  id: string,
  type: string,
  label: string,
  width: number,
  height: number,
  x: number,
  y: number,
  templateKind: TemplateComponentKind,
  template: Partial<NonNullable<CanvasComponent['template']>> = {},
): CanvasComponent {
  return {
    height,
    id,
    label,
    template: {
      templateKind,
      ...template,
    },
    type,
    width,
    x,
    y,
  };
}

function formElement(id: string, type: string, label: string, x: number, y: number): CanvasComponent {
  return {
    height: 72,
    id,
    label,
    placeholder: `Enter ${label.toLowerCase()}`,
    template: { templateKind: 'form' },
    type,
    width: 6,
    x,
    y,
  };
}

function button(id: string, label: string, x: number, y: number): CanvasComponent {
  return {
    events: { onClick: label },
    height: 64,
    id,
    label,
    template: { templateKind: 'ui' },
    type: 'Button',
    width: 3,
    x,
    y,
  };
}
