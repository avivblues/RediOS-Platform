import { Input, Select } from '../../components/atomic/atoms/Atoms';
import type { DesignedScreenField } from './screen-designer-types';

export function PropertyPanel({
  field,
  open = true,
  expertMode = false,
  onClose,
  onChange,
}: {
  field?: DesignedScreenField;
  open?: boolean;
  expertMode?: boolean;
  onClose?: () => void;
  onChange: (field: DesignedScreenField) => void;
}) {
  const panelClass = open ? 'studio-property-drawer studio-property-drawer-open' : 'studio-property-drawer';

  if (!field) {
    return (
      <section className={panelClass}>
        <div className="studio-section-header">
          <div>
            <span className="studio-kicker">Information Settings</span>
            <h4>Nothing selected</h4>
          </div>
          {onClose ? <button type="button" className="studio-drawer-close" onClick={onClose}>Close</button> : null}
        </div>
        <p className="studio-muted">Klik informasi di screen untuk mengatur label, behavior, dan layout.</p>
      </section>
    );
  }

  return (
    <section className={panelClass}>
      <div className="studio-section-header">
        <div>
          <span className="studio-kicker">Information Settings</span>
          <h3>{field.label}</h3>
        </div>
        {onClose ? <button type="button" className="studio-drawer-close" onClick={onClose}>Close</button> : null}
      </div>
      <label className="studio-form-field">
        Label
        <Input value={field.label} onChange={(label) => onChange({ ...field, label })} />
      </label>
      <div className="studio-list-row">
        <strong>Data Type</strong>
        <span>{field.type}</span>
      </div>
      <h4>Behavior</h4>
      <label className="studio-check-row">
        <input type="checkbox" checked={field.required} onChange={(event) => onChange({ ...field, required: event.target.checked })} />
        Must be filled
      </label>
      <label className="studio-check-row">
        <input type="checkbox" checked={field.showInList} onChange={(event) => onChange({ ...field, showInList: event.target.checked })} />
        Show on list
      </label>
      <label className="studio-check-row">
        <input type="checkbox" checked={Boolean(field.searchable)} onChange={(event) => onChange({ ...field, searchable: event.target.checked })} />
        Searchable
      </label>
      <h4>Layout</h4>
      <label className="studio-check-row">
        <input type="radio" checked={field.width === 'Full'} onChange={() => onChange({ ...field, width: 'Full' })} />
        Full row
      </label>
      <label className="studio-check-row">
        <input type="radio" checked={field.width === 'Half'} onChange={() => onChange({ ...field, width: 'Half' })} />
        Half row
      </label>
      {expertMode ? (
        <details>
          <summary>Developer Options</summary>
          <div className="studio-list-row">
            <strong>fieldCode</strong>
            <span>{field.sourceLabel}</span>
          </div>
          <div className="studio-form-field">
            <span className="studio-muted">metadata / JSON</span>
            <pre>{JSON.stringify(field, null, 2)}</pre>
          </div>
          <label className="studio-check-row">
            <input type="checkbox" checked={field.readonly} onChange={(event) => onChange({ ...field, readonly: event.target.checked })} />
            Readonly
          </label>
          <label className="studio-check-row">
            <input type="checkbox" checked={field.visible} onChange={(event) => onChange({ ...field, visible: event.target.checked })} />
            Visible
          </label>
          <Select value={field.width} options={['Full', 'Half', 'Third']} onChange={(value) => onChange({ ...field, width: value as DesignedScreenField['width'] })} />
        </details>
      ) : null}
    </section>
  );
}
