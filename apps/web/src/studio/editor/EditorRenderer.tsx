import type { PropsWithChildren } from 'react';
import { StudioPanel } from '../design-system/StudioDesignSystem';
import type { EditorDefinition } from './EditorDefinition';

export function EditorRenderer({
  definition,
  children,
}: PropsWithChildren<{
  definition: EditorDefinition;
}>) {
  return (
    <div className={definition.mode === 'CREATE' ? 'studio-editor studio-editor-create' : 'studio-editor studio-editor-edit'}>
      <StudioPanel title={definition.title}>
        <div className="studio-editor-hero">
          <div>
            <span className="studio-kicker">{definition.mode === 'CREATE' ? 'Buat Aplikasi' : 'Edit Aplikasi'}</span>
            <h2>{definition.title}</h2>
            <p className="studio-muted">{definition.subtitle}</p>
          </div>
          {definition.status ? <div className="studio-editor-status">{definition.status}</div> : null}
        </div>
        {children}
      </StudioPanel>
      {definition.assistant}
    </div>
  );
}
