import { ActionDesigner } from './actions/ActionDesigner';
import { ApiDesigner } from './api/ApiDesigner';
import { DataDesigner } from './data/DataDesigner';
import { AdminGuidePanel, HelpTip } from '../guide/AdminGuide';
import { CustomOrganismDesigner } from './organisms/CustomOrganismDesigner';

export function MetadataDesignerPage() {
  function focusSection(sectionId: string) {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <main className="redos-builder-page">
      <header className="redos-builder-header">
        <div>
          <span className="redos-kicker">Advanced Mode</span>
          <h1>Metadata Designer <HelpTip label="Advanced Mode" text="Area ini untuk admin teknis. Business user tetap bekerja di Visual Builder." /></h1>
          <p>Technical workspace untuk Data, Action, Connector, dan Custom Organism.</p>
        </div>
        <div className="redos-actions">
          <button data-redos-tooltip="Kembali ke Visual Builder untuk menyusun screen aplikasi." type="button" onClick={() => { window.location.href = '/studio'; }}>Back to Builder</button>
          <button data-redos-tooltip="Mulai aplikasi baru dari experience/template." type="button" onClick={() => { window.location.href = '/studio/create'; }}>Create App</button>
        </div>
      </header>

      <AdminGuidePanel
        title="Kapan memakai Advanced Mode?"
        description="Gunakan halaman ini hanya saat admin perlu membuat data/action/connector/custom component yang belum tersedia di builder."
        steps={[
          'Data Designer: buat Object dan Attribute yang akan dipakai binding.',
          'Action Designer: buat alur bisnis untuk tombol atau event.',
          'API Designer: buat connector custom, lalu panggil lewat Action step.',
          'Custom Organisms: buat reusable block agar muncul di toolbox builder.',
        ]}
      />

      <section className="redos-metadata-map" aria-label="Metadata designer navigation">
        <div className="redos-panel-heading">
          <span className="redos-kicker">Metadata Designer</span>
          <h3>Pilih area yang ingin diatur</h3>
          <p>Klik salah satu card untuk langsung menuju designer yang dibutuhkan.</p>
        </div>
        <div className="redos-metadata-nav-grid">
          <button type="button" onClick={() => focusSection('metadata-data')}>
            <strong>Data Object</strong>
            <span>Buat Object dan Attribute untuk Data Binding.</span>
          </button>
          <button type="button" onClick={() => focusSection('metadata-action')}>
            <strong>Action</strong>
            <span>Buat alur bisnis untuk tombol dan event.</span>
          </button>
          <button type="button" onClick={() => focusSection('metadata-connector')}>
            <strong>Connector</strong>
            <span>Hubungkan Action ke sistem eksternal.</span>
          </button>
          <button type="button" onClick={() => focusSection('metadata-organism')}>
            <strong>Custom Organism</strong>
            <span>Buat reusable block yang muncul di toolbox.</span>
          </button>
        </div>
      </section>

      <section className="redos-metadata-grid">
        <div id="metadata-data" className="redos-scroll-target"><DataDesigner /></div>
        <div id="metadata-action" className="redos-scroll-target"><ActionDesigner /></div>
        <div id="metadata-connector" className="redos-scroll-target"><ApiDesigner /></div>
        <div id="metadata-organism" className="redos-scroll-target redos-scroll-target-wide"><CustomOrganismDesigner /></div>
      </section>
    </main>
  );
}
