export type AtomicComponentLevel = 'design-token' | 'atom' | 'molecule' | 'organism' | 'template' | 'page';

export interface ExperienceComponentSchema {
  id: string;
  level: AtomicComponentLevel;
  component: string;
  props?: Record<string, unknown>;
  children?: ExperienceComponentSchema[];
}

export interface ExperienceSchema {
  code: string;
  applicationCode: string;
  root: ExperienceComponentSchema;
}
