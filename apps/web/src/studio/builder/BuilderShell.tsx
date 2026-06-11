import { useState } from 'react';
import { Canvas } from './Canvas/Canvas';
import { ComponentPanel } from './ComponentPanel/ComponentPanel';
import { DevicePreview } from './DevicePreview/DevicePreview';
import { PropertyPanel } from './PropertyPanel/PropertyPanel';
import { TreePanel } from './TreePanel/TreePanel';
import type { BuilderComponentDefinition, BuilderDataObject, CanvasComponent, StudioDevice, StudioTarget } from './types';

const initialComponents: CanvasComponent[] = [
  {
    id: 'product_name',
    type: 'TextInput',
    label: 'Product Name',
    placeholder: 'Enter product name',
    width: 12,
    height: 86,
    x: 0,
    y: 0,
    binding: { object: 'Product', field: 'name' },
  },
  {
    id: 'stock',
    type: 'NumberInput',
    label: 'Stock',
    placeholder: 'Enter stock',
    width: 12,
    height: 86,
    x: 0,
    y: 1,
    binding: { object: 'Product', field: 'stock' },
  },
  {
    id: 'save_product',
    type: 'Button',
    label: 'Save Product',
    width: 12,
    height: 72,
    x: 0,
    y: 2,
    events: { onClick: 'Save Product Action' },
  },
];

const dataObjects: BuilderDataObject[] = [
  { name: 'Product', fields: ['name', 'stock', 'price'] },
  { name: 'Customer', fields: ['name', 'phone'] },
];

export function BuilderShell({ target }: { target: StudioTarget }) {
  const [device, setDevice] = useState<StudioDevice>(target === 'android' ? 'Mobile' : 'Desktop');
  const [tab, setTab] = useState<'Components' | 'Data'>('Components');
  const [components, setComponents] = useState(initialComponents);
  const [selectedId, setSelectedId] = useState('product_name');
  const selected = components.find((component) => component.id === selectedId);

  function addComponent(definition: BuilderComponentDefinition) {
    const next: CanvasComponent = {
      id: `${definition.type}_${Date.now()}`,
      type: definition.type,
      label: definition.label,
      width: definition.type === 'Button' ? 12 : 6,
      height: definition.type === 'Table' ? 180 : 86,
      x: 0,
      y: components.length,
    };
    setComponents((current) => [...current, next]);
    setSelectedId(next.id);
  }

  function bindField(object: string, field: string) {
    if (!selected) {
      const next: CanvasComponent = {
        id: `${object}_${field}_${Date.now()}`,
        type: field === 'stock' || field === 'price' ? 'NumberInput' : 'TextInput',
        label: `${object} ${field}`,
        width: 6,
        height: 86,
        x: 0,
        y: components.length,
        binding: { object, field },
      };
      setComponents((current) => [...current, next]);
      setSelectedId(next.id);
      return;
    }

    setComponents((current) => current.map((component) => component.id === selected.id ? { ...component, binding: { object, field } } : component));
  }

  function updateSelected(next: Partial<CanvasComponent>) {
    if (!selected) {
      return;
    }

    setComponents((current) => current.map((component) => component.id === selected.id ? { ...component, ...next } : component));
  }

  return (
    <main className="redos-builder-page">
      <header className="redos-builder-header">
        <div>
          <span className="redos-kicker">RediOS Builder</span>
          <h1>{target === 'android' ? 'Android Experience Builder' : 'Visual Application Builder'}</h1>
        </div>
        <DevicePreview device={device} onDeviceChange={setDevice} />
        <div className="redos-actions">
          <button type="button">Save</button>
          <button type="button">Preview</button>
          <button type="button">Launch</button>
          <button type="button" onClick={() => { window.location.href = '/studio/metadata'; }}>Metadata</button>
        </div>
      </header>

      <section className="redos-builder-workspace">
        <aside className="redos-left-panel">
          <div className="redos-tabs">
            {(['Components', 'Data'] as const).map((nextTab) => (
              <button key={nextTab} className={tab === nextTab ? 'redos-tab-active' : ''} type="button" onClick={() => setTab(nextTab)}>
                {nextTab}
              </button>
            ))}
          </div>
          {tab === 'Components' ? (
            <ComponentPanel target={target} onAdd={addComponent} />
          ) : (
            <TreePanel dataObjects={dataObjects} onBindField={bindField} />
          )}
        </aside>

        <Canvas components={components} selectedId={selectedId} onSelect={setSelectedId} />

        <PropertyPanel selected={selected} onChange={updateSelected} />
      </section>
    </main>
  );
}
