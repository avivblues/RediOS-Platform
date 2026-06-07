import type { RuntimeForm, RuntimeFormField } from '../../core/renderer/runtime-types';
import { EmptyState } from '../../studio/empty/EmptyState';
import { humanizeCode } from '../../studio/humanizer/HumanizerEngine';
import { FormRenderer } from '../../renderer/FormRenderer';

export function FormCanvas({
  form,
  selectedFieldCode,
  onDropField,
  onSelectField,
}: {
  form?: RuntimeForm;
  selectedFieldCode?: string;
  onDropField: (fieldCode: string) => void;
  onSelectField: (field: RuntimeFormField) => void;
}) {
  return (
    <div className="studio-builder-canvas">
      <div className="studio-section-header">
        <strong>{form ? humanizeCode(form.form) : 'No form selected yet'}</strong>
        <span className="studio-muted">{form?.entityCode}</span>
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
        Drag an entity field here to create an ADD_FIELD draft operation
      </div>
      {form ? (
        <div className="studio-form-canvas-preview">
          {form.sections.map((section) => (
            <section key={section.code} className="studio-canvas-section">
              <h4>Section: {humanizeCode(section.code)}</h4>
              {section.fields.map((field) => (
                <button key={field.fieldCode} className="studio-field-card" onClick={() => onSelectField(field)}>
                  <span>{humanizeCode(field.fieldCode)}</span>
                  <div className="studio-input-placeholder" />
                </button>
              ))}
            </section>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No form selected yet"
          description="Choose an existing form or create a new one before arranging fields."
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
