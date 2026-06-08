import { Select } from '../../components/atomic/atoms/Atoms';
import type { DesignedScreenField } from './screen-designer-types';

export function PropertyPanel({
  field,
  onChange,
}: {
  field?: DesignedScreenField;
  onChange: (field: DesignedScreenField) => void;
}) {
  if (!field) {
    return (
      <section className="studio-card studio-screen-panel">
        <span className="studio-kicker">RIGHT</span>
        <h4>Properties</h4>
        <p className="studio-muted">Pilih informasi di canvas untuk mengatur label, required, readonly, width, dan visibility.</p>
      </section>
    );
  }

  return (
    <section className="studio-card studio-screen-panel">
      <span className="studio-kicker">RIGHT</span>
      <h4>Properties</h4>
      <div className="studio-list-row">
        <strong>Label</strong>
        <span>{field.label}</span>
      </div>
      <label className="studio-check-row">
        <input type="checkbox" checked={field.required} onChange={(event) => onChange({ ...field, required: event.target.checked })} />
        Required
      </label>
      <label className="studio-check-row">
        <input type="checkbox" checked={field.readonly} onChange={(event) => onChange({ ...field, readonly: event.target.checked })} />
        Readonly
      </label>
      <label className="studio-check-row">
        <input type="checkbox" checked={field.visible} onChange={(event) => onChange({ ...field, visible: event.target.checked })} />
        Visibility
      </label>
      <div className="studio-form-field">
        <span className="studio-muted">Width</span>
        <Select value={field.width} options={['Full', 'Half', 'Third']} onChange={(value) => onChange({ ...field, width: value as DesignedScreenField['width'] })} />
      </div>
    </section>
  );
}
