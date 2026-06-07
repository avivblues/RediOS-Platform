import { Badge } from '../../components/atomic/atoms/Atoms';
import type { RuntimeFormField } from '../../core/renderer/runtime-types';
import { EmptyState } from '../../studio/empty/EmptyState';
import { humanizeCode } from '../../studio/humanizer/HumanizerEngine';
import { PropertyEditor } from '../property/PropertyEditor';

export function PropertyPanel({
  field,
  valid,
  expertMode,
}: {
  field?: RuntimeFormField;
  valid?: boolean;
  expertMode: boolean;
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
            <strong>Label</strong>
            <span>{humanizeCode(field.fieldCode)}</span>
          </div>
          {expertMode ? (
            <div className="studio-list-row">
              <strong>Technical Code</strong>
              <span>{field.fieldCode}</span>
            </div>
          ) : null}
          <div className="studio-list-row">
            <strong>Component</strong>
            <span>{humanizeCode(field.component)}</span>
          </div>
          <div className="studio-list-row">
            <strong>Required</strong>
            <span>{String(field.required ?? false)}</span>
          </div>
          <div className="studio-list-row">
            <strong>Visibility</strong>
            <span>{field.visible === false ? 'Hidden' : 'Visible'}</span>
          </div>
          <div className="studio-list-row">
            <strong>Security</strong>
            <span>{String(field.readonly ?? false)}</span>
          </div>
          <div className="studio-list-row">
            <strong>Validation</strong>
            <span>{field.required ? 'Required' : 'Optional'}</span>
          </div>
          <div className="studio-list-row">
            <strong>Lookup relation</strong>
            <span>{field.relation?.code ?? '-'}</span>
          </div>
          <div className="studio-list-row">
            <strong>View</strong>
            <span>{field.view?.code ?? '-'}</span>
          </div>
          <PropertyEditor node={field as unknown as Record<string, unknown>} onChange={() => undefined} />
        </>
      ) : (
        <EmptyState
          title="No field selected yet"
          description="Click a field on the canvas to inspect label, component, security, and validation metadata."
        />
      )}
    </div>
  );
}
