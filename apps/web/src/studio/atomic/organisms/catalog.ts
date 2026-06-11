import type { BuilderComponentDefinition } from '../../builder/types';

export const organismComponents: BuilderComponentDefinition[] = [
  { type: 'Form', label: 'Form', layer: 'ORGANISM' },
  { type: 'Table', label: 'Table', layer: 'ORGANISM' },
  { type: 'WorkflowPanel', label: 'Workflow', layer: 'ORGANISM' },
  { type: 'Dashboard', label: 'Dashboard', layer: 'ORGANISM' },
  { type: 'Timeline', label: 'Timeline', layer: 'ORGANISM' },
];
