export type StudioTarget = 'web' | 'android';
export type StudioDevice = 'Desktop' | 'Tablet' | 'Mobile';
export type ComponentLayer = 'ATOM' | 'MOLECULE' | 'ORGANISM' | 'ANDROID';
export type ComponentMoveDirection = 'left' | 'right' | 'up' | 'down';
export type ComponentResizeDirection = 'narrower' | 'wider' | 'shorter' | 'taller';

export interface BuilderComponentDefinition {
  type: string;
  label: string;
  layer: ComponentLayer;
  description?: string;
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
    onBlur?: string;
    onClick?: string;
    onChange?: string;
    onFocus?: string;
    onLoad?: string;
    onSubmit?: string;
  };
  confirmation?: {
    enabled: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    cancelLabel: string;
    onConfirmAction?: string;
  };
  themeOverrides?: Record<string, string>;
  children?: CanvasComponent[];
}

export interface BuilderDataObject {
  name: string;
  fields: string[];
}
