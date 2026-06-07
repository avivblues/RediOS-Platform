import type { RuntimeComponentProps } from '../../core/renderer/render-context';

export function FormSectionRenderer({ context, children }: RuntimeComponentProps) {
  return (
    <section className="runtime-card">
      <h2>{context.form?.name ?? 'Form'}</h2>
      {children}
    </section>
  );
}

export function DetailCardRenderer({ children }: RuntimeComponentProps) {
  return <section className="runtime-card">{children}</section>;
}

export function ActionBarRenderer({ context }: RuntimeComponentProps) {
  return (
    <section className="runtime-card" aria-label="Actions">
      {context.actions.map((actionCode) => (
        <button
          key={actionCode}
          className="runtime-button"
          disabled={!context.entityCode || !context.documentId}
          onClick={() => {
            if (context.entityCode && context.documentId) {
              void context.client.runAction({
                entityCode: context.entityCode,
                documentId: context.documentId,
                actionCode,
                payload: context.document.data,
              });
            }
          }}
        >
          {actionCode}
        </button>
      ))}
    </section>
  );
}

export function DataTableRenderer({ context }: RuntimeComponentProps) {
  const columns = context.form?.sections.flatMap((section) => section.fields).filter((field) => field.visible) ?? [];

  return (
    <section className="runtime-card">
      <table>
        <thead>
          <tr>
            {columns.map((field) => (
              <th key={field.fieldCode}>{field.fieldCode}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {columns.map((field) => (
              <td key={field.fieldCode}>{String(context.document.data[field.fieldCode] ?? '')}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </section>
  );
}

export function TimelineRenderer() {
  return (
    <aside className="runtime-card">
      <h2>Timeline</h2>
      <p>Runtime events render here when event metadata is available.</p>
    </aside>
  );
}
