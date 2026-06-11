import type { CanvasComponent } from '../types';

export function Canvas({
  components,
  selectedId,
  onSelect,
}: {
  components: CanvasComponent[];
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  return (
    <section className="redos-canvas">
      <div className="redos-screen">
        <h2>Product Screen</h2>
        {components.map((component) => (
          <button
            key={component.id}
            type="button"
            className={selectedId === component.id ? 'redos-canvas-component redos-canvas-component-selected' : 'redos-canvas-component'}
            style={{
              gridColumn: `span ${component.width}`,
              minHeight: component.height,
            }}
            onClick={() => onSelect(component.id)}
          >
            <CanvasPreview component={component} />
          </button>
        ))}
      </div>
    </section>
  );
}

function CanvasPreview({ component }: { component: CanvasComponent }) {
  if (component.type === 'Button') {
    return <span className="redos-button-preview">{component.label}</span>;
  }

  if (component.type === 'Table') {
    return (
      <span className="redos-table-preview">
        <strong>{component.label}</strong>
        <small>Name | Stock | Price</small>
      </span>
    );
  }

  if (component.type === 'Dropdown' || component.type === 'Lookup') {
    return (
      <label>
        {component.label}
        <select disabled><option>{component.placeholder || 'Select value'}</option></select>
      </label>
    );
  }

  if (component.type === 'TextArea') {
    return (
      <label>
        {component.label}
        <textarea readOnly placeholder={component.placeholder || component.label} />
      </label>
    );
  }

  return (
    <label>
      {component.label}
      <input readOnly placeholder={component.placeholder || component.label} />
    </label>
  );
}
