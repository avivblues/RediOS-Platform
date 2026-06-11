import { atomComponents } from '../../atomic/atoms/catalog';
import { moleculeComponents } from '../../atomic/molecules/catalog';
import { organismComponents } from '../../atomic/organisms/catalog';
import type { BuilderComponentDefinition, StudioTarget } from '../types';

const androidComponents: BuilderComponentDefinition[] = [
  { type: 'Camera', label: 'Camera', layer: 'ANDROID' },
  { type: 'GPS', label: 'GPS', layer: 'ANDROID' },
  { type: 'Barcode', label: 'Barcode', layer: 'ANDROID' },
  { type: 'OfflineStorage', label: 'Offline Storage', layer: 'ANDROID' },
  { type: 'PushNotification', label: 'Push Notification', layer: 'ANDROID' },
];

export function ComponentPanel({
  target,
  onAdd,
}: {
  target: StudioTarget;
  onAdd: (component: BuilderComponentDefinition) => void;
}) {
  return (
    <div className="redos-panel-content">
      <h3>Components</h3>
      <ComponentGroup title="ATOM" components={atomComponents} onAdd={onAdd} />
      <ComponentGroup title="MOLECULE" components={moleculeComponents} onAdd={onAdd} />
      <ComponentGroup title="ORGANISM" components={organismComponents} onAdd={onAdd} />
      {target === 'android' ? <ComponentGroup title="ANDROID" components={androidComponents} onAdd={onAdd} /> : null}
    </div>
  );
}

function ComponentGroup({
  title,
  components,
  onAdd,
}: {
  title: string;
  components: BuilderComponentDefinition[];
  onAdd: (component: BuilderComponentDefinition) => void;
}) {
  return (
    <section className="redos-component-group">
      <strong>{title}</strong>
      {components.map((component) => (
        <button key={component.type} className="redos-tool-button" type="button" onClick={() => onAdd(component)}>
          <span>+</span>
          {component.label}
        </button>
      ))}
    </section>
  );
}
