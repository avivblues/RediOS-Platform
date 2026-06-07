import { Badge } from '../../components/atomic/atoms/Atoms';
import type { RuntimeFormField } from '../../core/renderer/runtime-types';
import { PropertyEditor } from '../property/PropertyEditor';

export function PropertyPanel({
  field,
  valid,
}: {
  field?: RuntimeFormField;
  valid?: boolean;
}) {
  return (
    <div className="studio-card">
      <div className="studio-section-header">
        <h4>Properties</h4>
        {valid !== undefined ? <Badge tone={valid ? 'success' : 'danger'}>{valid ? 'preview valid' : 'preview invalid'}</Badge> : null}
      </div>
      {field ? (
        <>
          <div className="studio-list-row">
            <strong>fieldCode</strong>
            <span>{field.fieldCode}</span>
          </div>
          <div className="studio-list-row">
            <strong>component</strong>
            <span>{field.component}</span>
          </div>
          <div className="studio-list-row">
            <strong>required</strong>
            <span>{String(field.required ?? false)}</span>
          </div>
          <div className="studio-list-row">
            <strong>readonly</strong>
            <span>{String(field.readonly ?? false)}</span>
          </div>
          <div className="studio-list-row">
            <strong>visibility</strong>
            <span>{field.visible === false ? 'hidden' : 'visible'}</span>
          </div>
          <div className="studio-list-row">
            <strong>lookup relation</strong>
            <span>{field.relation?.code ?? '-'}</span>
          </div>
          <div className="studio-list-row">
            <strong>view</strong>
            <span>{field.view?.code ?? '-'}</span>
          </div>
          <PropertyEditor node={field as unknown as Record<string, unknown>} onChange={() => undefined} />
        </>
      ) : (
        <div className="studio-empty">Click a field in the canvas to inspect metadata.</div>
      )}
    </div>
  );
}
