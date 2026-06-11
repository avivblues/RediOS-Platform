export type AtomicComponentKind =
  | 'Text Input'
  | 'Number'
  | 'Text Area'
  | 'Dropdown'
  | 'Checkbox'
  | 'Button'
  | 'Table'
  | 'Card'
  | 'Tabs'
  | 'Camera'
  | 'GPS'
  | 'Barcode'
  | 'Offline Sync';

export interface AtomicComponentDefinition {
  kind: AtomicComponentKind;
  layer: 'ATOM' | 'MOLECULE' | 'ORGANISM' | 'MOBILE';
  description: string;
}

export const webAtomicComponents: AtomicComponentDefinition[] = [
  { kind: 'Text Input', layer: 'ATOM', description: 'Single line user input' },
  { kind: 'Number', layer: 'ATOM', description: 'Numeric input' },
  { kind: 'Text Area', layer: 'ATOM', description: 'Long text input' },
  { kind: 'Dropdown', layer: 'MOLECULE', description: 'Choice from data source' },
  { kind: 'Checkbox', layer: 'ATOM', description: 'Boolean input' },
  { kind: 'Button', layer: 'ATOM', description: 'Connect to action' },
  { kind: 'Table', layer: 'ORGANISM', description: 'List records' },
  { kind: 'Card', layer: 'MOLECULE', description: 'Grouped content' },
  { kind: 'Tabs', layer: 'ORGANISM', description: 'Sectioned layout' },
];

export const androidAtomicComponents: AtomicComponentDefinition[] = [
  { kind: 'Text Input', layer: 'ATOM', description: 'Mobile text field' },
  { kind: 'Number', layer: 'ATOM', description: 'Numeric keyboard field' },
  { kind: 'Dropdown', layer: 'MOLECULE', description: 'Mobile picker' },
  { kind: 'Button', layer: 'ATOM', description: 'Connect to action' },
  { kind: 'Card', layer: 'MOLECULE', description: 'Mobile content card' },
  { kind: 'Camera', layer: 'MOBILE', description: 'Capture image' },
  { kind: 'GPS', layer: 'MOBILE', description: 'Capture location' },
  { kind: 'Barcode', layer: 'MOBILE', description: 'Scan barcode' },
  { kind: 'Offline Sync', layer: 'MOBILE', description: 'Queue changes offline' },
];
