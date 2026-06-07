import type { RuntimeForm, RuntimeFormField } from '../core/renderer/runtime-types';
import { renderRegisteredComponent } from './ComponentRegistry';

export function FormRenderer({ form }: { form?: RuntimeForm }) {
  if (!form) {
    return <div className="studio-empty">Select a form to preview.</div>;
  }

  return (
    <div className="studio-form-preview">
      {form.sections.map((section) => (
        <section key={section.code} className="studio-card">
          <h4>{section.code}</h4>
          {section.fields.map((field) => (
            <RenderedField key={field.fieldCode} field={field} />
          ))}
        </section>
      ))}
    </div>
  );
}

function RenderedField({ field }: { field: RuntimeFormField }) {
  if (field.visible === false) {
    return null;
  }

  return (
    <div className="studio-form-field">
      <span className="studio-label">{field.fieldCode}</span>
      {renderRegisteredComponent(field.component, field.fieldCode)}
    </div>
  );
}
