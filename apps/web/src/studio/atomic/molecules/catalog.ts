import type { BuilderComponentDefinition } from '../../builder/types';

export const moleculeComponents: BuilderComponentDefinition[] = [
  { type: 'Search', label: 'Search', layer: 'MOLECULE' },
  { type: 'Lookup', label: 'Lookup', layer: 'MOLECULE' },
  { type: 'UploadField', label: 'Upload', layer: 'MOLECULE' },
  { type: 'Dropdown', label: 'Dropdown', layer: 'MOLECULE' },
  { type: 'TextArea', label: 'Text Area', layer: 'MOLECULE' },
];
