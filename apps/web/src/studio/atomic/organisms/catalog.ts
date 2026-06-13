import type { BuilderComponentDefinition } from '../../builder/types';

export const organismComponents: BuilderComponentDefinition[] = [
  { type: 'Form', label: 'Form', layer: 'ORGANISM' },
  { type: 'FormHeading', label: 'Form heading', layer: 'ORGANISM', description: 'Heading for form' },
  { type: 'SectionHeading', label: 'Section heading', layer: 'ORGANISM', description: 'Heading for sections' },
  { type: 'Subheading', label: 'Subheading', layer: 'ORGANISM', description: 'Heading for subsections' },
  { type: 'Divider', label: 'Divider', layer: 'ORGANISM', description: 'Adds visual separation' },
  { type: 'Spacer', label: 'Spacer', layer: 'ORGANISM', description: 'Empty space between elements' },
  { type: 'Captcha', label: 'Captcha', layer: 'ORGANISM', description: 'Prevents submission by robots' },
  { type: 'Submit', label: 'Submit', layer: 'ORGANISM', description: 'Triggers form submission' },
  { type: 'Pages', label: 'Pages', layer: 'ORGANISM', description: 'Break the form into steps' },
  { type: 'Group', label: 'Group', layer: 'ORGANISM', description: 'A container to group elements' },
  { type: 'Grid', label: 'Grid', layer: 'ORGANISM', description: 'Create complex layouts' },
  { type: 'Table', label: 'Table', layer: 'ORGANISM' },
  { type: 'DataTable', label: 'DataTable', layer: 'ORGANISM', description: 'Searchable table with rows and actions' },
  { type: 'InputTable', label: 'Input Table', layer: 'ORGANISM', description: 'Excel-like editable grid' },
  { type: 'Modal', label: 'Modal', layer: 'ORGANISM', description: 'Dialog for focused user flow' },
  { type: 'ConfirmModal', label: 'Confirm Modal', layer: 'ORGANISM', description: 'Approval or delete confirmation dialog' },
  { type: 'WorkflowPanel', label: 'Workflow', layer: 'ORGANISM' },
  { type: 'Dashboard', label: 'Dashboard', layer: 'ORGANISM' },
  { type: 'Timeline', label: 'Timeline', layer: 'ORGANISM' },
];
