import { useState } from 'react';
import { Button, Input, Select } from '../../components/atomic/atoms/Atoms';
import {
  androidAtomicComponents,
  type AtomicComponentDefinition,
  type AtomicComponentKind,
  webAtomicComponents,
} from '../atomic/AtomicComponentCatalog';
import { RuntimePreviewPanel } from '../runtime-preview/RuntimePreviewPanel';

export type BuilderDevice = 'Desktop' | 'Tablet' | 'Mobile' | 'Android';

export interface BuilderCanvasComponent {
  id: string;
  kind: AtomicComponentKind;
  label: string;
  binding?: string;
  action?: string;
  width: 'Full' | 'Half' | 'Third';
}

const productTemplate: BuilderCanvasComponent[] = [
  { id: 'name', kind: 'Text Input', label: 'Product Name', binding: 'Product.name', width: 'Full' },
  { id: 'stock', kind: 'Number', label: 'Stock', binding: 'Product.stock', width: 'Half' },
  { id: 'status', kind: 'Dropdown', label: 'Status', binding: 'Product.status', width: 'Half' },
  { id: 'saveButton', kind: 'Button', label: 'Save Product', action: 'Save Product Action', width: 'Full' },
];

const dataItems = [
  { object: 'Product', attributes: ['name', 'stock', 'price', 'status'] },
];

const actionOptions = ['Save Product Action', 'Update Stock Action', 'Notify Low Stock Action', 'Navigate Product List'];

export function RediosVisualBuilder({
  target = 'web',
}: {
  target?: 'web' | 'android';
}) {
  const [device, setDevice] = useState<BuilderDevice>(target === 'android' ? 'Android' : 'Desktop');
  const [components, setComponents] = useState<BuilderCanvasComponent[]>(productTemplate);
  const [selectedId, setSelectedId] = useState('saveButton');
  const selected = components.find((component) => component.id === selectedId) ?? components[0];
  const catalog = target === 'android' ? androidAtomicComponents : webAtomicComponents;
  const visibleDevices = target === 'android' ? ['Android'] as BuilderDevice[] : ['Desktop', 'Tablet', 'Mobile'] as BuilderDevice[];

  function addComponent(component: AtomicComponentDefinition) {
    const next: BuilderCanvasComponent = {
      id: `${component.kind.replace(/\s+/g, '')}_${Date.now()}`,
      kind: component.kind,
      label: component.kind,
      width: component.kind === 'Button' ? 'Full' : 'Half',
    };
    setComponents((current) => [...current, next]);
    setSelectedId(next.id);
  }

  function updateSelected(next: Partial<BuilderCanvasComponent>) {
    setComponents((current) => current.map((component) => component.id === selected?.id ? { ...component, ...next } : component));
  }

  return (
    <main className="redios-builder-page">
      <header className="redios-builder-topbar">
        <div>
          <span className="studio-kicker">RediOS Visual Builder</span>
          <h1>Build the experience first</h1>
          <p className="studio-muted">Design screens, connect actions, and let RediOS prepare the runtime behind the scene.</p>
        </div>
        <div className="visual-builder-device-switch">
          {visibleDevices.map((nextDevice) => (
            <button key={nextDevice} className={device === nextDevice ? 'studio-chip studio-chip-active' : 'studio-chip'} type="button" onClick={() => setDevice(nextDevice)}>
              {nextDevice}
            </button>
          ))}
        </div>
        <div className="studio-action-row">
          <Button variant="secondary" onClick={() => setComponents(productTemplate)}>Product Template</Button>
          <Button variant="secondary">Save</Button>
          <Button variant="secondary">Preview</Button>
          <Button>Launch</Button>
        </div>
      </header>

      <section className="redios-builder-workspace">
        <aside className="redios-builder-panel">
          <h3>Components</h3>
          <div className="redios-toolbox">
            {catalog.map((component) => (
              <button key={component.kind} className="visual-builder-palette-item" type="button" onClick={() => addComponent(component)}>
                <span>+</span>
                <strong>{component.kind}</strong>
                <small>{component.layer} - {component.description}</small>
              </button>
            ))}
          </div>

          <h3>Data</h3>
          {dataItems.map((item) => (
            <div key={item.object} className="redios-data-card">
              <strong>{item.object}</strong>
              {item.attributes.map((attribute) => (
                <button
                  key={attribute}
                  className="studio-tree-item"
                  type="button"
                  onClick={() => {
                    const next: BuilderCanvasComponent = {
                      id: `${attribute}_${Date.now()}`,
                      kind: attribute === 'stock' || attribute === 'price' ? 'Number' : 'Text Input',
                      label: attribute.replace(/^\w/, (value) => value.toUpperCase()),
                      binding: `${item.object}.${attribute}`,
                      width: 'Half',
                    };
                    setComponents((current) => [...current, next]);
                    setSelectedId(next.id);
                  }}
                >
                  {attribute}
                </button>
              ))}
            </div>
          ))}
        </aside>

        <section className="redios-builder-canvas">
          <RuntimePreviewPanel device={device} components={components} />
        </section>

        <aside className="redios-builder-panel">
          <h3>Properties</h3>
          {selected ? (
            <div className="visual-builder-inspector">
              <label className="studio-form-field">
                Label
                <Input value={selected.label} onChange={(label) => updateSelected({ label })} />
              </label>
              <label className="studio-form-field">
                Width
                <Select value={selected.width} options={['Full', 'Half', 'Third']} onChange={(width) => updateSelected({ width: width as BuilderCanvasComponent['width'] })} />
              </label>
              <label className="studio-form-field">
                Binding
                <Select
                  value={selected.binding ?? 'None'}
                  options={['None', 'Product.name', 'Product.stock', 'Product.price', 'Product.status']}
                  onChange={(binding) => updateSelected({ binding: binding === 'None' ? undefined : binding })}
                />
              </label>
              <label className="studio-form-field">
                Event
                <Select
                  value={selected.action ?? 'None'}
                  options={['None', ...actionOptions]}
                  onChange={(action) => updateSelected({ action: action === 'None' ? undefined : action })}
                />
              </label>
              <p className="studio-muted">Buttons connect to Actions. Actions generate API runtime capability behind the scene.</p>
            </div>
          ) : null}

        </aside>
      </section>
    </main>
  );
}

