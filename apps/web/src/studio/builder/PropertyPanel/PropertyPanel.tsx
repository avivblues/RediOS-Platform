import { useMemo } from 'react';
import { HelpTip } from '../../guide/AdminGuide';
import { loadActions } from '../../metadata/metadata-store';
import type { BuilderDataObject, CanvasComponent } from '../types';

export function PropertyPanel({
  dataObjects,
  selected,
  onChange,
  onDelete,
}: {
  dataObjects: BuilderDataObject[];
  selected?: CanvasComponent;
  onChange: (next: Partial<CanvasComponent>) => void;
  onDelete: () => void;
}) {
  const actionOptions = useMemo(() => ['None', ...loadActions().map((action) => action.label)], []);

  if (!selected) {
    return (
      <aside className="redos-property-panel">
        <div className="redos-panel-heading">
          <span className="redos-kicker">Inspector</span>
          <h3>Properties <HelpTip label="Inspector" text="Panel ini muncul setelah memilih component di canvas. Di sini admin mengatur label, layout, data, dan action." /></h3>
        </div>
        <p className="redos-muted">Pilih component di canvas untuk mengatur tampilannya.</p>
      </aside>
    );
  }

  const selectedObject = selected.binding?.object ?? dataObjects[0]?.name ?? '';
  const fieldOptions = dataObjects.find((object) => object.name === selectedObject)?.fields ?? [];
  const selectedField = selected.binding?.field ?? fieldOptions[0] ?? '';

  return (
    <aside className="redos-property-panel">
      <div className="redos-panel-heading">
        <span className="redos-kicker">Inspector</span>
        <h3>{selected.label}</h3>
        <p className="redos-muted">{selected.type} · {selected.id}</p>
      </div>

      <section>
        <h4>General <HelpTip label="General" text="Atur nama tampilan, placeholder, ukuran, dan posisi component di screen." /></h4>
        <label>
          Component ID
          <input value={selected.id} readOnly />
        </label>
        <label>
          Label <HelpTip label="Label" text="Teks yang dilihat user di layar aplikasi." />
          <input value={selected.label} onChange={(event) => onChange({ label: event.target.value })} />
        </label>
        <label>
          Placeholder <HelpTip label="Placeholder" text="Contoh teks bantuan di dalam input sebelum user mengisi data." />
          <input value={selected.placeholder ?? ''} onChange={(event) => onChange({ placeholder: event.target.value })} />
        </label>
        <label>
          Width <HelpTip label="Width" text="Lebar component di canvas. Full untuk satu baris penuh, Half untuk dua kolom." />
          <select value={selected.width} onChange={(event) => onChange({ width: Number(event.target.value) })}>
            <option value={12}>Full</option>
            <option value={6}>Half</option>
            <option value={4}>Third</option>
            <option value={3}>Quarter</option>
          </select>
        </label>
        <label>
          Column <HelpTip label="Column" text="Posisi horizontal component pada grid 12 kolom." />
          <select value={selected.x} onChange={(event) => onChange({ x: Number(event.target.value) })}>
            {Array.from({ length: 12 }, (_, index) => (
              <option key={index} value={index}>{index + 1}</option>
            ))}
          </select>
        </label>
        <label>
          Height <HelpTip label="Height" text="Tinggi component. Bisa juga diubah dengan handle Resize di canvas." />
          <input type="number" value={selected.height} onChange={(event) => onChange({ height: Number(event.target.value) })} />
        </label>
      </section>

      <section>
        <h4>Data Binding <HelpTip label="Data Binding" text="Hubungkan component ke Data agar nilai bisa disimpan atau ditampilkan oleh runtime." /></h4>
        <label>
          Object
          <select
            value={selectedObject}
            onChange={(event) => {
              const nextObject = dataObjects.find((object) => object.name === event.target.value);
              onChange({ binding: { object: event.target.value, field: nextObject?.fields[0] ?? '' } });
            }}
          >
            {dataObjects.map((object) => <option key={object.name}>{object.name}</option>)}
          </select>
        </label>
        <label>
          Field
          <select
            value={selectedField}
            onChange={(event) => onChange({ binding: { object: selectedObject, field: event.target.value } })}
          >
            {fieldOptions.map((field) => <option key={field}>{field}</option>)}
          </select>
        </label>
        <p className="redos-muted">This generates DATA binding metadata behind the scenes.</p>
      </section>

      <section>
        <h4>Action <HelpTip label="Action" text="Action adalah alur bisnis, misalnya Save Product atau Approve Asset. Button tidak memanggil API langsung." /></h4>
        <label>
          On Click
          <select
            value={selected.events?.onClick ?? 'None'}
            onChange={(event) => onChange({ events: { ...selected.events, onClick: event.target.value === 'None' ? undefined : event.target.value } })}
          >
            {actionOptions.map((action) => <option key={action}>{action}</option>)}
          </select>
        </label>
        <p className="redos-muted">Buttons bind to Action Metadata. They never call runtime endpoints directly from the builder.</p>
      </section>

      <section className="redos-danger-zone">
        <h4>Delete <HelpTip label="Delete" text="Menghapus component dari screen. Data dan Action yang sudah dibuat tetap ada di Advanced Mode." /></h4>
        <p className="redos-muted">Remove this component from the screen. Saved backend metadata will be updated when metadata sync is connected.</p>
        <button type="button" onClick={onDelete}>
          Delete selected component
        </button>
      </section>
    </aside>
  );
}
