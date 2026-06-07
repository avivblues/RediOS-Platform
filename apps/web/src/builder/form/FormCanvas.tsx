import type { RuntimeForm, RuntimeFormField } from '../../core/renderer/runtime-types';
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
        <strong>{form?.form ?? 'No form selected'}</strong>
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
      <FormRenderer form={form} />
      <div className="studio-list">
        {form?.sections.flatMap((section) => section.fields).map((field) => (
          <button key={field.fieldCode} className="studio-tree-item" onClick={() => onSelectField(field)}>
            {field.fieldCode} | {field.component}
          </button>
        ))}
      </div>
    </div>
  );
}
