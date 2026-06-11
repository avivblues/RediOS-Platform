import { Input, Select } from '../../components/atomic/atoms/Atoms';
import type { DesignedScreenField } from './screen-designer-types';

export function PropertyPanel({
  field,
  entityName,
  open = true,
  expertMode = false,
  onClose,
  onChange,
}: {
  field?: DesignedScreenField;
  entityName: string;
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
      <label className="studio-form-field">
        Component
        <Select
          value={field.componentKind ?? 'Information'}
          options={['Information', 'Dropdown', 'Link Data', 'File', 'Button']}
          onChange={(value) => onChange(componentChange(field, value as DesignedScreenField['componentKind'], entityName))}
        />
      </label>
      {field.componentKind !== 'Button' ? (
        <label className="studio-form-field">
          Data Type
          <Select
            value={field.type}
            options={['Text', 'Long Text', 'Number', 'Money', 'Date', 'Date Time', 'Boolean', 'Lookup', 'Attachment', 'User']}
            onChange={(value) => onChange({ ...field, type: value as DesignedScreenField['type'] })}
          />
        </label>
      ) : null}
      {field.componentKind === 'Dropdown' ? (
        <label className="studio-form-field">
          Dropdown Options
          <Input
            value={(field.choiceOptions ?? []).join(', ')}
            placeholder="Draft, Active, Archived"
            onChange={(value) => onChange({ ...field, choiceOptions: value.split(',').map((option) => option.trim()).filter(Boolean) })}
          />
        </label>
      ) : null}
      {field.componentKind === 'Link Data' ? (
        <>
          <label className="studio-form-field">
            Link Data Object
            <Input value={field.relatedObject ?? ''} placeholder="Customer" onChange={(relatedObject) => onChange({ ...field, relatedObject, type: 'Lookup' })} />
          </label>
          <label className="studio-form-field">
            Display Information
            <Input value={field.displayField ?? ''} placeholder="name" onChange={(displayField) => onChange({ ...field, displayField })} />
          </label>
        </>
      ) : null}
      {field.componentKind === 'Button' ? (
        <>
          <label className="studio-form-field">
            Button Action
            <Select
              value={field.actionType ?? 'Save'}
              options={['Save', 'Next', 'Open Link', 'Custom']}
              onChange={(value) => onChange({ ...field, actionType: value as DesignedScreenField['actionType'] })}
            />
          </label>
          <label className="studio-form-field">
            Target
            <Input value={field.actionTarget ?? ''} placeholder="/products or next screen" onChange={(actionTarget) => onChange({ ...field, actionTarget })} />
          </label>
        </>
      ) : null}
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

function componentChange(field: DesignedScreenField, componentKind: DesignedScreenField['componentKind'], entityName: string): DesignedScreenField {
  if (componentKind === 'Dropdown') {
    return {
      ...field,
      componentKind,
      type: 'Text',
      designerOnly: false,
      choiceOptions: field.choiceOptions?.length ? field.choiceOptions : ['Option 1', 'Option 2'],
    };
  }

  if (componentKind === 'Link Data') {
    return {
      ...field,
      componentKind,
      type: 'Lookup',
      designerOnly: false,
      relatedObject: field.relatedObject || entityName,
      displayField: field.displayField,
    };
  }

  if (componentKind === 'File') {
    return {
      ...field,
      componentKind,
      type: 'Attachment',
      designerOnly: false,
    };
  }

  if (componentKind === 'Button') {
    return {
      ...field,
      componentKind,
      type: 'Boolean',
      designerOnly: true,
      required: false,
      searchable: false,
      showInList: false,
      actionType: field.actionType ?? 'Save',
    };
  }

  return {
    ...field,
    componentKind: 'Information',
    designerOnly: false,
  };
}
