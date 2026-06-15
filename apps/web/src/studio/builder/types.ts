export type StudioTarget = 'web' | 'android';
export type StudioDevice = 'Desktop' | 'Tablet' | 'Mobile';
export type ComponentLayer = 'ATOM' | 'MOLECULE' | 'ORGANISM' | 'ANDROID';
export type ComponentMoveDirection = 'left' | 'right' | 'up' | 'down';
export type ComponentResizeDirection = 'narrower' | 'wider' | 'shorter' | 'taller';
export type BuilderComponentCategory =
  | 'Fields'
  | 'Static'
  | 'Layout'
  | 'Data Display'
  | 'Dashboard'
  | 'Charts'
  | 'Navigation'
  | 'Feedback'
  | 'Media'
  | 'Advanced'
  | 'Page Templates';

export type TemplateComponentKind =
  | 'auth'
  | 'blank'
  | 'calendar'
  | 'chart'
  | 'dashboard'
  | 'error'
  | 'feedback'
  | 'form'
  | 'layout'
  | 'media'
  | 'navigation'
  | 'profile'
  | 'table'
  | 'ui';

export interface ComponentMetadataCapabilities {
  action?: boolean;
  chart?: boolean;
  columns?: boolean;
  data?: boolean;
  media?: boolean;
  permission?: boolean;
  query?: boolean;
}

export interface TemplateComponentConfig {
  chart?: {
    categories?: string[];
    kind: 'area' | 'bar' | 'line' | 'pie' | 'radial';
    metricField?: string;
    series?: Array<{
      data: number[];
      name: string;
    }>;
    seriesField?: string;
  };
  columns?: Array<{
    field: string;
    label: string;
  }>;
  dataSource?: {
    object?: string;
    query?: string;
  };
  metrics?: Array<{
    field?: string;
    label: string;
    value?: string;
  }>;
  page?: string;
  permission?: string;
  templateKind?: TemplateComponentKind;
  variant?: string;
}

export interface BuilderComponentDefinition {
  type: string;
  label: string;
  layer: ComponentLayer;
  category?: BuilderComponentCategory;
  defaultConfig?: TemplateComponentConfig;
  defaultSize?: {
    height: number;
    width: number;
  };
  description?: string;
  metadataCapabilities?: ComponentMetadataCapabilities;
}

export interface CanvasComponent {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  readonly?: boolean;
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
  template?: TemplateComponentConfig;
  themeOverrides?: Record<string, string>;
  children?: CanvasComponent[];
}

export interface BuilderDataObject {
  name: string;
  fields: string[];
}
