import { Badge } from '../../components/atomic/atoms/Atoms';
import type { RuntimeFormField } from '../../core/renderer/runtime-types';
import { EmptyState } from '../../studio/empty/EmptyState';
import { HelpTooltip } from '../../studio/help/HelpTooltip';
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
        <h4>
          Details
          <HelpTooltip label="Details">This panel explains the selected information and how users will interact with it.</HelpTooltip>
        </h4>
        {valid !== undefined ? <Badge tone={valid ? 'success' : 'danger'}>{valid ? 'preview valid' : 'preview invalid'}</Badge> : null}
      </div>
      {field ? (
        <>
          <div className="studio-list-row">
            <strong>Display name</strong>
            <span>{humanizeCode(field.fieldCode)}</span>
          </div>
          {expertMode ? (
            <div className="studio-list-row">
              <strong>Technical Code</strong>
              <span>{field.fieldCode}</span>
            </div>
          ) : null}
          <div className="studio-list-row">
            <strong>Input type</strong>
            <span>{humanizeCode(field.component)}</span>
          </div>
          <div className="studio-list-row">
            <strong>Must be filled?</strong>
            <span>{String(field.required ?? false)}</span>
          </div>
          <div className="studio-list-row">
            <strong>Visible to users?</strong>
            <span>{field.visible === false ? 'Hidden' : 'Visible'}</span>
          </div>
          <div className="studio-list-row">
            <strong>Editable?</strong>
            <span>{String(field.readonly ?? false)}</span>
          </div>
          <div className="studio-list-row">
            <strong>Rule</strong>
            <span>{field.required ? 'Required' : 'Optional'}</span>
          </div>
          <div className="studio-list-row">
            <strong>Connection</strong>
            <span>{field.relation?.code ?? '-'}</span>
          </div>
          <div className="studio-list-row">
            <strong>List screen</strong>
            <span>{field.view?.code ?? '-'}</span>
          </div>
          <PropertyEditor node={field as unknown as Record<string, unknown>} onChange={() => undefined} />
        </>
      ) : (
        <EmptyState
          title="No information selected yet"
          description="Click information on the screen to understand its display name, input type, rules, and connections."
        />
      )}
    </div>
  );
}
