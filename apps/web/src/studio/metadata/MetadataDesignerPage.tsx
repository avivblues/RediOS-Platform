import { ActionDesigner } from './actions/ActionDesigner';
import { ApiDesigner } from './api/ApiDesigner';
import { DataDesigner } from './data/DataDesigner';
import { AdminGuidePanel, HelpTip } from '../guide/AdminGuide';
import { CustomOrganismDesigner } from './organisms/CustomOrganismDesigner';

type MetadataDesignerSection = 'overview' | 'data' | 'action' | 'connector' | 'organisms';

const metadataSections: Array<{
  id: Exclude<MetadataDesignerSection, 'overview'>;
  title: string;
  description: string;
  path: string;
}> = [
  {
    id: 'data',
    title: 'Data Designer',
    description: 'Buat Data Object dan Attribute untuk Data Binding.',
    path: '/studio/metadata/data',
  },
  {
    id: 'action',
    title: 'Action Designer',
    description: 'Buat alur bisnis untuk tombol dan event.',
    path: '/studio/metadata/action',
  },
  {
    id: 'connector',
    title: 'Connector Designer',
    description: 'Hubungkan Action ke sistem eksternal.',
    path: '/studio/metadata/connector',
  },
  {
    id: 'organisms',
    title: 'Custom Organisms',
    description: 'Buat reusable block yang muncul di toolbox.',
    path: '/studio/metadata/organisms',
  },
];

export function MetadataDesignerPage() {
  const activeSection = metadataSectionFromPath(window.location.pathname);
  const activeDefinition = metadataSections.find((section) => section.id === activeSection);

  return (
    <main className="redos-builder-page">
      <header className="redos-builder-header">
        <div>
          <span className="redos-kicker">Advanced Mode</span>
          <h1>{activeDefinition?.title ?? 'Metadata Designer'} <HelpTip label="Advanced Mode" text="Area ini untuk admin teknis. Business user tetap bekerja di Visual Builder." /></h1>
          <p>{activeDefinition?.description ?? 'Pilih satu area metadata untuk dibuat atau dimodifikasi secara terpisah.'}</p>
        </div>
        <div className="redos-actions">
          <button data-redos-tooltip="Kembali ke Visual Builder untuk menyusun screen aplikasi." type="button" onClick={() => { window.location.href = '/studio'; }}>Back to Builder</button>
          <button data-redos-tooltip="Mulai aplikasi baru dari experience/template." type="button" onClick={() => { window.location.href = '/studio/create'; }}>Create App</button>
        </div>
      </header>

      <section className="redos-metadata-shell">
        <MetadataDesignerSidebar activeSection={activeSection} />

        <div className="redos-metadata-content">
          {activeSection === 'overview' ? (
            <>
              <AdminGuidePanel
                title="Kapan memakai Advanced Mode?"
                description="Gunakan halaman ini hanya saat admin perlu membuat data/action/connector/custom component yang belum tersedia di builder."
                steps={[
                  'Data Designer: buat Object dan Attribute yang akan dipakai binding.',
                  'Action Designer: buat alur bisnis untuk tombol atau event.',
                  'Connector Designer: buat connector, lalu panggil lewat Action step.',
                  'Custom Organisms: buat reusable block agar muncul di toolbox builder.',
                ]}
              />

              <section className="redos-metadata-map" aria-label="Metadata designer menu">
                <div className="redos-panel-heading">
                  <span className="redos-kicker">Metadata Designer</span>
                  <h3>Pilih halaman designer</h3>
                  <p>Setiap area dibuka di halaman terpisah supaya modifikasi lebih fokus dan tidak penuh dalam satu layar.</p>
                </div>
                <MetadataDesignerNav activeSection={activeSection} />
              </section>
            </>
          ) : (
            <section className="redos-metadata-single-page">
              {activeSection === 'data' ? <DataDesigner /> : null}
              {activeSection === 'action' ? <ActionDesigner /> : null}
              {activeSection === 'connector' ? <ApiDesigner /> : null}
              {activeSection === 'organisms' ? <CustomOrganismDesigner /> : null}
            </section>
          )}
        </div>
      </section>
    </main>
  );
}

function MetadataDesignerSidebar({ activeSection }: { activeSection: MetadataDesignerSection }) {
  return (
    <aside className="redos-metadata-sidebar" aria-label="Advanced Mode navigation">
      <div className="redos-panel-heading">
        <span className="redos-kicker">Advanced Mode</span>
        <h3>Menu</h3>
        <p>Pilih satu designer untuk fokus modifikasi.</p>
      </div>

      <nav className="redos-metadata-sidebar-nav">
        <button
          className={activeSection === 'overview' ? 'redos-metadata-sidebar-active' : ''}
          type="button"
          onClick={() => { window.location.href = '/studio/metadata'; }}
        >
          <strong>Overview</strong>
          <span>Panduan Advanced Mode</span>
        </button>

        {metadataSections.map((section) => (
          <button
            key={section.id}
            className={activeSection === section.id ? 'redos-metadata-sidebar-active' : ''}
            type="button"
            onClick={() => { window.location.href = section.path; }}
          >
            <strong>{section.title}</strong>
            <span>{section.description}</span>
          </button>
        ))}
      </nav>

      <div className="redos-metadata-sidebar-actions">
        <button type="button" onClick={() => { window.location.href = '/studio'; }}>Back to Builder</button>
        <button type="button" onClick={() => { window.location.href = '/studio/create'; }}>Create App</button>
      </div>
    </aside>
  );
}

function MetadataDesignerNav({ activeSection }: { activeSection: MetadataDesignerSection }) {
  return (
    <div className="redos-metadata-nav-grid">
      {metadataSections.map((section) => (
        <button
          key={section.id}
          className={activeSection === section.id ? 'redos-metadata-nav-card-active' : ''}
          type="button"
          onClick={() => { window.location.href = section.path; }}
        >
          <strong>{section.title}</strong>
          <span>{section.description}</span>
        </button>
      ))}
    </div>
  );
}

function metadataSectionFromPath(pathname: string): MetadataDesignerSection {
  if (pathname.startsWith('/studio/metadata/data')) {
    return 'data';
  }

  if (pathname.startsWith('/studio/metadata/action')) {
    return 'action';
  }

  if (pathname.startsWith('/studio/metadata/connector')) {
    return 'connector';
  }

  if (pathname.startsWith('/studio/metadata/organisms')) {
    return 'organisms';
  }

  return 'overview';
}
