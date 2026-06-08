import { useMemo, useState } from 'react';
import type { RuntimeForm, RuntimeFormField } from '../core/renderer/runtime-types';
import { humanizeCode } from '../studio/humanizer/HumanizerEngine';

interface RuntimeFormRendererProps {
  form?: RuntimeForm;
}

export function RuntimeFormRenderer({ form }: RuntimeFormRendererProps) {
  const fields = useMemo(() => form?.sections.flatMap((section) => section.fields) ?? [], [form]);
  const [values, setValues] = useState<Record<string, string>>({});

  if (!form) {
    return (
      <section className="runtime-card">
        <h2>No input screen available</h2>
        <p>This application has navigation metadata, but no form metadata is connected to the selected page yet.</p>
      </section>
    );
  }

  return (
    <section className="runtime-card runtime-form-workspace">
      <div>
        <span className="studio-kicker">Input Screen</span>
        <h2>{form.name}</h2>
      </div>

      {form.sections.map((section) => (
        <div key={section.code} className="runtime-form-section">
          <h3>{humanizeCode(section.code)}</h3>
          <div className="runtime-form-grid">
            {section.fields.map((field) => (
              <RuntimeField
                key={field.fieldCode}
                field={field}
                value={values[field.fieldCode] ?? ''}
                onChange={(value) => setValues((current) => ({ ...current, [field.fieldCode]: value }))}
              />
            ))}
          </div>
        </div>
      ))}

      {fields.length === 0 ? (
        <p className="studio-muted">No information fields are configured for this screen yet.</p>
      ) : (
        <p className="studio-muted">Data entry is metadata-driven. Persistence runs through configured runtime actions.</p>
      )}
    </section>
  );
}

function RuntimeField({
  field,
  value,
  onChange,
}: {
  field: RuntimeFormField;
  value: string;
  onChange: (value: string) => void;
}) {
  if (field.visible === false) {
    return null;
  }

  const inputType = field.component === 'NUMBER_INPUT' ? 'number' : field.component === 'DATE_INPUT' ? 'date' : 'text';

  return (
    <label className="runtime-form-field">
      <span>{humanizeCode(field.fieldCode)}</span>
      {field.component === 'TEXTAREA' ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} />
      ) : field.component === 'CHECKBOX' ? (
        <input type="checkbox" checked={value === 'true'} onChange={(event) => onChange(String(event.target.checked))} />
      ) : (
        <input type={inputType} value={value} placeholder={humanizeCode(field.fieldCode)} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
  );
}
