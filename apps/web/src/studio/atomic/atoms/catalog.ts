import type { BuilderComponentDefinition } from '../../builder/types';

export const atomComponents: BuilderComponentDefinition[] = [
  { type: 'TextInput', label: 'Text Input', layer: 'ATOM' },
  { type: 'NumberInput', label: 'Number', layer: 'ATOM' },
  { type: 'Button', label: 'Button', layer: 'ATOM' },
  { type: 'Image', label: 'Image', layer: 'ATOM' },
  { type: 'Checkbox', label: 'Checkbox', layer: 'ATOM' },
  { type: 'Icon', label: 'Icon', layer: 'ATOM' },
];
