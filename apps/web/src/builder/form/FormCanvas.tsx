import type { RuntimeForm, RuntimeFormField } from '../../core/renderer/runtime-types';
import { EmptyState } from '../../studio/empty/EmptyState';
import { HelpTooltip } from '../../studio/help/HelpTooltip';
import { humanizeCode } from '../../studio/humanizer/HumanizerEngine';

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
        <div>
          <span className="studio-kicker">Area Tengah</span>
          <strong>
            {form ? humanizeCode(form.form) : 'Belum ada Layar Input dipilih'}
            <HelpTooltip label="Kanvas">Area tengah adalah susunan layar. Seret informasi ke sini agar muncul untuk pengguna.</HelpTooltip>
          </strong>
        </div>
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
        Seret informasi ke sini untuk menambahkannya ke layar
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
          title="Belum ada layar dipilih"
          description="Pilih Layar Input yang sudah ada sebelum menyusun informasi."
        />
      )}
      {form ? (
        <div className="studio-list studio-edit-field-list">
          {form.sections.flatMap((section) => section.fields).map((field) => (
            <button key={field.fieldCode} className="studio-tree-item" onClick={() => onSelectField(field)} title={`Lihat detail ${humanizeCode(field.fieldCode)}.`}>
              {humanizeCode(field.fieldCode)} | {humanizeCode(field.component)}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
