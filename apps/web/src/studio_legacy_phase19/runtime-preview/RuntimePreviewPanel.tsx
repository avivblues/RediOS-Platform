import type { BuilderCanvasComponent, BuilderDevice } from '../builder/RediosVisualBuilder';

export function RuntimePreviewPanel({
  device,
  components,
}: {
  device: BuilderDevice;
  components: BuilderCanvasComponent[];
}) {
  return (
    <section className={`redios-runtime-preview redios-runtime-preview-${device.toLowerCase()}`}>
      <div className="redios-preview-frame">
        <div className="redios-preview-header">
          <strong>Product Screen</strong>
          <span>{device}</span>
        </div>
        <div className="redios-preview-body">
          {components.map((component) => (
            <PreviewComponent key={component.id} component={component} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PreviewComponent({ component }: { component: BuilderCanvasComponent }) {
  if (component.kind === 'Button') {
    return <button className="redios-preview-button" type="button">{component.label}</button>;
  }

  if (component.kind === 'Dropdown') {
    return (
      <label className="redios-preview-field">
        <span>{component.label}</span>
        <select disabled><option>Select {component.label}</option></select>
      </label>
    );
  }

  if (component.kind === 'Text Area') {
    return (
      <label className="redios-preview-field">
        <span>{component.label}</span>
        <textarea readOnly placeholder={component.label} />
      </label>
    );
  }

  if (component.kind === 'Table') {
    return (
      <div className="redios-preview-table">
        <strong>{component.label}</strong>
        <div>Name | Stock | Status</div>
      </div>
    );
  }

  return (
    <label className="redios-preview-field">
      <span>{component.label}</span>
      <input readOnly placeholder={component.label} />
    </label>
  );
}
