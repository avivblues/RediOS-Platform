import type { DesignedScreenLayout, PreviewDevice } from './screen-designer-types';

export function PreviewPanel({
  layout,
  device,
  onDeviceChange,
}: {
  layout: DesignedScreenLayout;
  device: PreviewDevice;
  onDeviceChange: (device: PreviewDevice) => void;
}) {
  return (
    <section className="studio-card studio-preview-panel">
      <div className="studio-section-header">
        <div>
          <span className="studio-kicker">Adaptive Preview</span>
          <h4>User sees real generated app preview</h4>
        </div>
        <div className="studio-action-row">
          {(['Desktop', 'Tablet', 'Mobile'] as PreviewDevice[]).map((nextDevice) => (
            <button
              key={nextDevice}
              type="button"
              className={device === nextDevice ? 'studio-chip studio-chip-active' : 'studio-chip'}
              onClick={() => onDeviceChange(nextDevice)}
            >
              {nextDevice}
            </button>
          ))}
        </div>
      </div>
      <div className={`studio-adaptive-preview studio-adaptive-preview-${device.toLowerCase()}`}>
        <div className="studio-preview-menu">Menu: {layout.entityName}</div>
        <div className="studio-preview-toolbar">
          <strong>{layout.entityName} Screen</strong>
          <button type="button">+ Add {layout.entityName}</button>
        </div>
        {layout.sections.map((section) => (
          <div key={section.id} className="studio-preview-section">
            <strong>{section.title}</strong>
            <div className="studio-preview-fields" data-device={device}>
              {section.fields.filter((field) => field.visible).map((field) => (
                <label key={field.id}>
                  {field.label}
                  <input placeholder={field.label} readOnly />
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
