import { Input, Select } from '../../components/atomic/atoms/Atoms';
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
        <p className="studio-muted">Pilih informasi di canvas untuk mengatur label, input type, required, visible, dan list screen.</p>
      </section>
    );
  }

  return (
    <section className="studio-card studio-screen-panel">
      <span className="studio-kicker">RIGHT</span>
      <h4>Properties</h4>
      <h3>{field.label}</h3>
      <label className="studio-form-field">
        Label
        <Input value={field.label} onChange={(label) => onChange({ ...field, label })} />
      </label>
      <div className="studio-list-row">
        <strong>Input Type</strong>
        <span>{field.type}</span>
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
        Visible
      </label>
      <label className="studio-check-row">
        <input type="checkbox" checked={field.showInList} onChange={(event) => onChange({ ...field, showInList: event.target.checked })} />
        List Screen
      </label>
      <div className="studio-form-field">
        <span className="studio-muted">Width</span>
        <Select value={field.width} options={['Full', 'Half', 'Third']} onChange={(value) => onChange({ ...field, width: value as DesignedScreenField['width'] })} />
      </div>
    </section>
  );
}
