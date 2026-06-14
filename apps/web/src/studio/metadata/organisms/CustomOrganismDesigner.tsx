import { useMemo, useState } from 'react';
import { atomComponents } from '../../atomic/atoms/catalog';
import { moleculeComponents } from '../../atomic/molecules/catalog';
import { organismComponents } from '../../atomic/organisms/catalog';
import { HelpTip } from '../../guide/AdminGuide';
import {
  loadCustomOrganisms,
  saveCustomOrganisms,
  toComponentType,
  type StudioCustomOrganismDraft,
} from '../metadata-store';
import { MetadataConfirmDeleteModal } from '../shared/MetadataConfirmDeleteModal';

const availableBlocks = [...atomComponents, ...moleculeComponents, ...organismComponents];

export function CustomOrganismDesigner() {
  const [organisms, setOrganisms] = useState(() => loadCustomOrganisms());
  const [label, setLabel] = useState('Approval Card');
  const [description, setDescription] = useState('Reusable approval experience with summary, status, and action.');
  const [selectedComponents, setSelectedComponents] = useState<string[]>(['TextInput', 'Dropdown', 'Button']);
  const [pendingDelete, setPendingDelete] = useState<StudioCustomOrganismDraft>();
  const preview = useMemo(() => selectedComponents.join(' + '), [selectedComponents]);

  function persist(nextOrganisms: StudioCustomOrganismDraft[]) {
    setOrganisms(nextOrganisms);
    saveCustomOrganisms(nextOrganisms);
  }

  function toggleComponent(type: string) {
    setSelectedComponents((current) => current.includes(type) ? current.filter((item) => item !== type) : [...current, type]);
  }

  function saveOrganism() {
    const nextOrganism: StudioCustomOrganismDraft = {
      type: toComponentType(label),
      label: label.trim() || 'Custom Organism',
      description: description.trim() || 'Reusable custom organism',
      components: selectedComponents,
    };
    persist([nextOrganism, ...organisms.filter((organism) => organism.type !== nextOrganism.type)]);
  }

  function removeOrganism(type: string) {
    persist(organisms.filter((organism) => organism.type !== type));
  }

  return (
    <section className="redos-metadata-card redos-metadata-card-wide">
      <div className="redos-panel-heading">
        <span className="redos-kicker">Reusable Experience</span>
        <h3>Custom Organisms <HelpTip label="Custom Organism" text="Reusable block buatan admin, misalnya Approval Card atau Inventory Header, lalu muncul di toolbox builder." /></h3>
        <p>Buat komposisi component yang bisa dipakai ulang oleh admin lain.</p>
      </div>

      <div className="redos-designer-grid">
        <div className="redos-designer-form">
          <label>
            Organism Name <HelpTip label="Organism Name" text="Gunakan nama blok pengalaman, bukan nama teknis. Contoh: Approval Card." />
            <input value={label} onChange={(event) => setLabel(event.target.value)} />
          </label>
          <label>
            Description <HelpTip label="Description" text="Jelaskan kapan organism ini sebaiknya dipakai oleh admin." />
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} />
          </label>
          <div className="redos-picker-grid" aria-label="Organism composition">
            {availableBlocks.map((component) => (
              <button
                key={component.type}
                className={selectedComponents.includes(component.type) ? 'redos-picker-active' : ''}
                type="button"
                data-redos-tooltip={`Pilih ${component.label} sebagai bagian dari custom organism.`}
                onClick={() => toggleComponent(component.type)}
              >
                <strong>{component.label}</strong>
                <span>{component.layer}</span>
              </button>
            ))}
          </div>
          <button className="redos-primary-action" data-redos-tooltip="Simpan organism agar muncul di toolbox builder bagian Custom Organisms." type="button" onClick={saveOrganism}>Save Custom Organism</button>
        </div>

        <div className="redos-organism-preview-card">
          <span className="redos-kicker">Preview Composition</span>
          <strong>{label}</strong>
          <p>{description}</p>
          <div>{preview || 'Select components to compose this organism.'}</div>
        </div>
      </div>

      <div className="redos-metadata-list">
        {organisms.map((organism) => (
          <div key={organism.type} className="redos-list-row">
            <span>
              <strong>{organism.label}</strong>
              <small>{organism.components.join(' + ')}</small>
            </span>
            <button data-redos-tooltip="Hapus custom organism dari toolbox draft lokal." type="button" onClick={() => setPendingDelete(organism)}>Delete</button>
          </div>
        ))}
      </div>
      {pendingDelete ? (
        <MetadataConfirmDeleteModal
          title="Delete Custom Organism?"
          target={pendingDelete.label}
          onCancel={() => setPendingDelete(undefined)}
          onConfirm={() => {
            removeOrganism(pendingDelete.type);
            setPendingDelete(undefined);
          }}
        />
      ) : null}
    </section>
  );
}
