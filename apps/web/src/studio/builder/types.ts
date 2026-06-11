export type StudioTarget = 'web' | 'android';
export type StudioDevice = 'Desktop' | 'Tablet' | 'Mobile';
export type ComponentLayer = 'ATOM' | 'MOLECULE' | 'ORGANISM' | 'ANDROID';

export interface BuilderComponentDefinition {
  type: string;
  label: string;
  layer: ComponentLayer;
}

export interface CanvasComponent {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  width: number;
  height: number;
  x: number;
  y: number;
  binding?: {
    object: string;
    field: string;
  };
  events?: {
    onClick?: string;
    onChange?: string;
  };
}

export interface BuilderDataObject {
  name: string;
  fields: string[];
}
