import type React from 'react';
import type { MetadataClient } from '../metadata-client/metadata-client';
import type {
  ResolvedUIAtom,
  ResolvedUIMolecule,
  ResolvedUIOrganism,
  RuntimeDocumentState,
  RuntimeForm,
  RuntimeFormField,
  RuntimeNavigation,
  RuntimeTheme,
} from './runtime-types';

export interface RuntimeRenderContext {
  client: MetadataClient;
  theme: RuntimeTheme;
  navigation: RuntimeNavigation;
  form?: RuntimeForm;
  document: RuntimeDocumentState;
  setDocument: (document: RuntimeDocumentState) => void;
  activeField?: RuntimeFormField;
  entityCode?: string;
  documentId?: string;
  actions: string[];
}

export interface RuntimeComponentProps {
  node: ResolvedUIAtom | ResolvedUIMolecule | ResolvedUIOrganism;
  context: RuntimeRenderContext;
  children?: React.ReactNode;
}

export type RuntimeComponentRenderer = (props: RuntimeComponentProps) => React.ReactElement | null;
