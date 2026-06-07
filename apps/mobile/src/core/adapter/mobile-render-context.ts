import type { RuntimeRendererContext } from '@redios/runtime-renderer-core';
import type { MobileMetadataClient } from '../api/mobile-metadata-client';
import type {
  MobileNavigation,
  MobileRuntimeForm,
  MobileRuntimeTheme,
  RuntimeDocumentState,
  RuntimeExperience,
  RuntimeFormField,
} from '../api/mobile-runtime-types';

export interface MobileRuntimeRenderContext {
  client: MobileMetadataClient;
  rendererContext: RuntimeRendererContext;
  experience: RuntimeExperience;
  theme: MobileRuntimeTheme;
  navigation: MobileNavigation;
  form?: MobileRuntimeForm;
  document: RuntimeDocumentState;
  setDocument: (document: RuntimeDocumentState) => void;
  entityCode?: string;
  documentId?: string;
  actions: string[];
}

export function activeFieldForNode(
  context: MobileRuntimeRenderContext,
  fieldCode: unknown,
): RuntimeFormField | undefined {
  return typeof fieldCode === 'string'
    ? context.form?.sections.flatMap((section) => section.fields).find((field) => field.fieldCode === fieldCode)
    : undefined;
}
