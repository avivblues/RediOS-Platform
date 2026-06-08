import { createDocumentState } from '@redios/runtime-renderer-core';
import { useMemo, useState } from 'react';
import { RuntimeRenderer } from '../core/renderer/runtime-renderer';
import type { RuntimeRenderContext } from '../core/renderer/render-context';
import type { ResolvedUIPage, RuntimeForm, RuntimeNavigation, RuntimeTheme } from '../core/renderer/runtime-types';
import { RuntimeFormRenderer } from './RuntimeFormRenderer';

interface RuntimePageRendererProps {
  page?: ResolvedUIPage;
  form?: RuntimeForm;
  theme: RuntimeTheme;
  navigation: RuntimeNavigation;
  renderContext: Omit<RuntimeRenderContext, 'theme' | 'navigation' | 'form' | 'document' | 'setDocument' | 'entityCode' | 'actions'>;
}

export function RuntimePageRenderer({ page, form, theme, navigation, renderContext }: RuntimePageRendererProps) {
  const initialDocument = useMemo(
    () => (form ? createDocumentState(form.sections.flatMap((section) => section.fields)) : { data: {} }),
    [form],
  );
  const [document, setDocument] = useState(initialDocument);

  if (!page) {
    return <RuntimeFormRenderer form={form} />;
  }

  const context: RuntimeRenderContext = {
    ...renderContext,
    theme,
    navigation,
    form,
    document,
    setDocument,
    entityCode: page.page.entityCode,
    actions: page.page.actions ?? [],
  };

  return (
    <>
      <RuntimeRenderer page={page} context={context} />
      <RuntimeFormRenderer form={form} />
    </>
  );
}
