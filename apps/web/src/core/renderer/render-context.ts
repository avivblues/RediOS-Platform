import type React from 'react';
import type { RuntimeNode, RuntimeRendererContext } from '@redios/runtime-renderer-core';
import type { MetadataClient } from '../metadata-client/metadata-client';
import type {
  RuntimeDocumentState,
  RuntimeForm,
  RuntimeFormField,
  RuntimeNavigation,
  RuntimeTheme,
} from './runtime-types';

export interface RuntimeRenderContext {
  client: MetadataClient;
  rendererContext: RuntimeRendererContext;
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
  node: RuntimeNode;
  context: RuntimeRenderContext;
  children?: React.ReactNode;
}

export type RuntimeComponentRenderer = (props: RuntimeComponentProps) => React.ReactElement | null;
