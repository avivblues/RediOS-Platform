import type { RuntimeForm, RuntimeFormField } from '../../core/renderer/runtime-types';
import { EmptyState } from '../../studio/empty/EmptyState';
import { HelpTooltip } from '../../studio/help/HelpTooltip';
import { humanizeCode } from '../../studio/humanizer/HumanizerEngine';
import { FormRenderer } from '../../renderer/FormRenderer';

export function FormCanvas({
  form,
  selectedFieldCode,
  expertMode,
  onDropField,
  onSelectField,
}: {
  form?: RuntimeForm;
  selectedFieldCode?: string;
  expertMode: boolean;
  onDropField: (fieldCode: string) => void;
  onSelectField: (field: RuntimeFormField) => void;
}) {
  return (
    <div className="studio-builder-canvas">
      <div className="studio-section-header">
        <strong>
          {form ? humanizeCode(form.form) : 'No Input Screen selected yet'}
          <HelpTooltip label="Canvas">This center area is the screen layout. Drag information here to add it for users.</HelpTooltip>
        </strong>
        <span className="studio-muted">{form ? `Data: ${humanizeCode(form.entityCode)}` : ''}</span>
        {expertMode && form ? <span className="studio-muted">Technical Code: {form.form}</span> : null}
      </div>
      <div
        className="studio-drop-zone"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const droppedField = event.dataTransfer.getData('application/redios-field') || selectedFieldCode;

          if (droppedField) {
            onDropField(droppedField);
          }
        }}
      >
        Drag information here to add it to this screen
      </div>
      {form ? (
        <div className="studio-form-canvas-preview">
          {form.sections.map((section) => (
            <section key={section.code} className="studio-canvas-section">
              <h4>{humanizeCode(section.code)} Details</h4>
              {section.fields.map((field) => (
                <button key={field.fieldCode} className="studio-field-card" onClick={() => onSelectField(field)}>
                  <span>{humanizeCode(field.fieldCode)}</span>
                  {expertMode ? <small>{field.fieldCode}</small> : null}
                  <div className="studio-input-placeholder" />
                </button>
              ))}
            </section>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No form selected yet"
          description="Choose an existing Input Screen or create one before arranging information."
        />
      )}
      <FormRenderer form={form} />
      <div className="studio-list">
        {form?.sections.flatMap((section) => section.fields).map((field) => (
          <button key={field.fieldCode} className="studio-tree-item" onClick={() => onSelectField(field)}>
            {humanizeCode(field.fieldCode)} | {humanizeCode(field.component)}
          </button>
        ))}
      </div>
    </div>
  );
}
