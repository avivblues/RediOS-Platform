import type { ScreenComponentType } from './screen-designer-types';

const components: ScreenComponentType[] = ['Text Input', 'Number', 'Date', 'Dropdown', 'Table', 'Button', 'Section', 'Tabs'];

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
      <section className="studio-card studio-screen-panel">
        <span className="studio-kicker">LEFT</span>
        <h4>Information</h4>
        <p className="studio-muted">Tambah informasi, lalu RediOS langsung menaruhnya di screen.</p>
        <button className="studio-button studio-button-primary" type="button" onClick={onAddInformation}>
          + Add Information
        </button>
        <h4>Layout</h4>
        <div className="studio-component-palette">
          {(['Section', 'Tabs'] as ScreenComponentType[]).map((component) => (
            <button key={component} className="studio-tree-item" type="button" onClick={() => onSelect(component)} title={`Tambahkan ${component} ke screen.`}>
              + {component}
            </button>
          ))}
          <button className="studio-tree-item" type="button" onClick={() => onSelect('Section')} title="Tambahkan grup informasi ke screen.">
            + Group
          </button>
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
