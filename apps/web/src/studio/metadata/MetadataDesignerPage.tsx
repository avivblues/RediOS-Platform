import { ActionDesigner } from './actions/ActionDesigner';
import { ApiDesigner } from './api/ApiDesigner';
import { DataDesigner } from './data/DataDesigner';
import { AdminGuidePanel, HelpTip } from '../guide/AdminGuide';
import { CustomOrganismDesigner } from './organisms/CustomOrganismDesigner';

export function MetadataDesignerPage() {
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

      <section className="redos-metadata-map">
        <strong>METADATA DESIGNER</strong>
        <div>
          <span>DATA<br /><small>schema</small></span>
          <span>EVENT<br /><small>logic</small></span>
          <span>API<br /><small>connector</small></span>
          <span>ORGANISM<br /><small>custom UX</small></span>
        </div>
      </section>

      <section className="redos-metadata-grid">
        <DataDesigner />
        <ActionDesigner />
        <ApiDesigner />
        <CustomOrganismDesigner />
      </section>
    </main>
  );
}
