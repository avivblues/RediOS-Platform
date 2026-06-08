import type { ReactNode } from 'react';

export type MetadataEditorMode = 'CREATE' | 'EDIT';

export interface EditorDefinition {
  mode: MetadataEditorMode;
  title: string;
  subtitle: string;
  status?: ReactNode;
  assistant?: ReactNode;
}
