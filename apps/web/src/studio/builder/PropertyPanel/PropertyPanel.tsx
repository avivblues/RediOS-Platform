import type { CanvasComponent } from '../types';

const actionOptions = ['None', 'Save Product Action', 'Update Stock Action', 'Notify Low Stock Action'];
const objectOptions = ['Product', 'Customer'];
const productFields = ['name', 'stock', 'price', 'status'];

export function PropertyPanel({
  selected,
  onChange,
}: {
  selected?: CanvasComponent;
  onChange: (next: Partial<CanvasComponent>) => void;
}) {
  if (!selected) {
    return (
      <aside className="redos-property-panel">
        <h3>Properties</h3>
        <p className="redos-muted">Select a component on the canvas.</p>
      </aside>
    );
  }

  return (
    <aside className="redos-property-panel">
      <h3>Properties</h3>

      <section>
        <h4>General</h4>
        <label>
          Name
          <input value={selected.id} readOnly />
        </label>
        <label>
          Label
          <input value={selected.label} onChange={(event) => onChange({ label: event.target.value })} />
        </label>
        <label>
          Placeholder
          <input value={selected.placeholder ?? ''} onChange={(event) => onChange({ placeholder: event.target.value })} />
        </label>
        <label>
          Width
          <select value={selected.width} onChange={(event) => onChange({ width: Number(event.target.value) })}>
            <option value={12}>Full</option>
            <option value={6}>Half</option>
            <option value={4}>Third</option>
          </select>
        </label>
        <label>
          Height
          <input type="number" value={selected.height} onChange={(event) => onChange({ height: Number(event.target.value) })} />
        </label>
      </section>

      <section>
        <h4>Data Binding</h4>
        <label>
          Object
          <select
            value={selected.binding?.object ?? 'Product'}
            onChange={(event) => onChange({ binding: { object: event.target.value, field: selected.binding?.field ?? 'name' } })}
          >
            {objectOptions.map((object) => <option key={object}>{object}</option>)}
          </select>
        </label>
        <label>
          Field
          <select
            value={selected.binding?.field ?? 'name'}
            onChange={(event) => onChange({ binding: { object: selected.binding?.object ?? 'Product', field: event.target.value } })}
          >
            {productFields.map((field) => <option key={field}>{field}</option>)}
          </select>
        </label>
      </section>

      <section>
        <h4>Action</h4>
        <label>
          On Click
          <select
            value={selected.events?.onClick ?? 'None'}
            onChange={(event) => onChange({ events: { ...selected.events, onClick: event.target.value === 'None' ? undefined : event.target.value } })}
          >
            {actionOptions.map((action) => <option key={action}>{action}</option>)}
          </select>
        </label>
        <p className="redos-muted">Buttons bind to Action Metadata. They never call API endpoints directly.</p>
      </section>
    </aside>
  );
}
