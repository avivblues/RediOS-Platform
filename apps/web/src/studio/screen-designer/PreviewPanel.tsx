import type { DesignedScreenLayout, PreviewDevice } from './screen-designer-types';

export function PreviewPanel({
  layout,
  device,
  compact = false,
  onDeviceChange,
}: {
  layout: DesignedScreenLayout;
  device: PreviewDevice;
  compact?: boolean;
  onDeviceChange: (device: PreviewDevice) => void;
}) {
  return (
    <section className={compact ? 'studio-card studio-preview-panel studio-mobile-builder-preview' : 'studio-card studio-preview-panel'}>
      <div className="studio-section-header">
        <div>
          <span className="studio-kicker">{compact ? 'Mobile Preview' : 'Adaptive Preview'}</span>
          <h4>{compact ? 'Phone' : 'User sees real generated app preview'}</h4>
        </div>
        {!compact ? <div className="studio-action-row">
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
        </div> : null}
      </div>
      <div className={`studio-adaptive-preview studio-adaptive-preview-${device.toLowerCase()}${compact ? ' studio-phone-frame' : ''}`}>
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
                  {field.componentKind === 'Button' ? (
                    <button type="button">{field.label}</button>
                  ) : field.componentKind === 'Dropdown' || field.componentKind === 'Link Data' || field.type === 'Lookup' ? (
                    <select value="" disabled>
                      <option value="">{field.componentKind === 'Link Data' ? `Select ${field.relatedObject || 'data'}` : `Choose ${field.label}`}</option>
                    </select>
                  ) : field.type === 'Long Text' ? (
                    <textarea placeholder="Enter description..." readOnly />
                  ) : (
                    <input placeholder={field.label} readOnly />
                  )}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
