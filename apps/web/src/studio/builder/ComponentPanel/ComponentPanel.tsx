import { useMemo } from 'react';
import { atomComponents } from '../../atomic/atoms/catalog';
import { moleculeComponents } from '../../atomic/molecules/catalog';
import { organismComponents } from '../../atomic/organisms/catalog';
import { customOrganismsAsComponents } from '../../metadata/metadata-store';
import { HelpTip } from '../../guide/AdminGuide';
import type { BuilderComponentDefinition, StudioTarget } from '../types';

const REDIOS_COMPONENT_MIME = 'application/x-redios-component';

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
  const customOrganisms = useMemo(() => customOrganismsAsComponents(), []);

  return (
    <div className="redos-panel-content">
      <div className="redos-panel-heading">
        <span className="redos-kicker">Toolbox</span>
        <h3>Components <HelpTip label="Components" text="Komponen adalah bagian layar seperti input, dropdown, tombol, tabel, dan custom organism." /></h3>
        <p className="redos-muted">Drag atau klik component untuk menambahkannya ke screen.</p>
      </div>
      <ComponentGroup description="Single reusable controls" title="Atoms" components={atomComponents} onAdd={onAdd} />
      <ComponentGroup description="Field groups and common inputs" title="Molecules" components={moleculeComponents} onAdd={onAdd} />
      <ComponentGroup description="Composed screen sections" title="Organisms" components={organismComponents} onAdd={onAdd} />
      {customOrganisms.length > 0 ? (
        <ComponentGroup description="Reusable organisms created in Advanced Mode" title="Custom Organisms" components={customOrganisms} onAdd={onAdd} />
      ) : null}
      {target === 'android' ? <ComponentGroup description="Mobile runtime capabilities" title="Android" components={androidComponents} onAdd={onAdd} /> : null}
    </div>
  );
}

function ComponentGroup({
  description,
  title,
  components,
  onAdd,
}: {
  description: string;
  title: string;
  components: BuilderComponentDefinition[];
  onAdd: (component: BuilderComponentDefinition) => void;
}) {
  return (
    <section className="redos-component-group">
      <header>
        <strong>{title}</strong>
        <span>{description}</span>
      </header>
      {components.map((component) => (
        <button
          key={component.type}
          className="redos-tool-button"
          draggable
          type="button"
          onClick={() => onAdd(component)}
          onDragStart={(event) => {
            event.dataTransfer.effectAllowed = 'copy';
            event.dataTransfer.setData(REDIOS_COMPONENT_MIME, JSON.stringify(component));
            event.currentTarget.classList.add('redos-tool-button-dragging');
          }}
          onDragEnd={(event) => {
            event.currentTarget.classList.remove('redos-tool-button-dragging');
          }}
          data-redos-tooltip={`Drag atau klik untuk menambahkan ${component.label} ke screen.`}
          title={`Drag or click to add ${component.label}`}
        >
          <span aria-hidden="true">+</span>
          <span>
            <strong>{component.label}</strong>
            <small>{component.layer}</small>
          </span>
        </button>
      ))}
    </section>
  );
}
