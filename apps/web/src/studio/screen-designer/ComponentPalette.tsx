import type { ScreenComponentType } from './screen-designer-types';

const components: ScreenComponentType[] = ['Text Input', 'Number', 'Date', 'Dropdown', 'Table', 'Button', 'Section', 'Tabs'];

export function ComponentPalette({
  onSelect,
}: {
  onSelect: (component: ScreenComponentType) => void;
}) {
  return (
    <section className="studio-card studio-screen-panel">
      <span className="studio-kicker">LEFT</span>
      <h4>Components</h4>
      <p className="studio-muted">Pilih komponen layar yang ingin digunakan.</p>
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
