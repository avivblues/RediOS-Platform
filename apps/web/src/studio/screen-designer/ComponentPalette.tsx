import type { ScreenComponentType } from './screen-designer-types';

const components: ScreenComponentType[] = ['Text Input', 'Number', 'Date', 'Dropdown', 'Table', 'Button', 'Section', 'Tabs'];
const simpleComponents: Array<{ component: ScreenComponentType; label: string; hint: string }> = [
  { component: 'Text Input', label: 'Text', hint: 'Nama, kode, catatan singkat' },
  { component: 'Number', label: 'Number', hint: 'Harga, stok, jumlah' },
  { component: 'Date', label: 'Date', hint: 'Tanggal transaksi atau jatuh tempo' },
  { component: 'Dropdown', label: 'Dropdown', hint: 'Pilihan status, kategori, prioritas' },
  { component: 'Table', label: 'Link Data', hint: 'Ambil data dari object lain' },
  { component: 'Button', label: 'Button', hint: 'Save, Next, atau aksi custom' },
  { component: 'Section', label: 'Section', hint: 'Kelompokkan informasi' },
];

export function ComponentPalette({
  expertMode = false,
  onSelect,
  onAddInformation,
}: {
  expertMode?: boolean;
  onSelect: (component: ScreenComponentType) => void;
  onAddInformation: () => void;
}) {
  if (!expertMode) {
    return (
      <section className="studio-card studio-screen-panel studio-component-sidebar">
        <span className="studio-kicker">Add Fields</span>
        <h4>Build this screen</h4>
        <p className="studio-muted">Tambah input, dropdown, link data, button, dan layout ke screen.</p>
        <button className="studio-button studio-button-primary" type="button" onClick={onAddInformation}>
          + Add Information
        </button>
        <div className="studio-component-palette">
          {simpleComponents.map((item) => (
            <button key={item.label} className="studio-builder-component" type="button" onClick={() => onSelect(item.component)} title={`Tambahkan ${item.label} ke screen.`}>
              <strong>{item.label}</strong>
              <span>{item.hint}</span>
            </button>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="studio-card studio-screen-panel">
      <span className="studio-kicker">LEFT</span>
      <h4>Advanced Components</h4>
      <p className="studio-muted">Pilih raw component untuk screen metadata.</p>
      <div className="studio-component-palette">
        {components.map((component) => (
          <button key={component} className="studio-tree-item" type="button" onClick={() => onSelect(component)} title={`Tambahkan ${component} ke screen.`}>
            {component}
          </button>
        ))}
      </div>
    </section>
  );
}
