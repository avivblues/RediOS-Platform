import type { PropsWithChildren } from 'react';
import { EditorRenderer } from './EditorRenderer';
import type { EditorDefinition } from './EditorDefinition';

export function MetadataEditor({
  definition,
  children,
}: PropsWithChildren<{
  definition: EditorDefinition;
}>) {
  return <EditorRenderer definition={definition}>{children}</EditorRenderer>;
}
