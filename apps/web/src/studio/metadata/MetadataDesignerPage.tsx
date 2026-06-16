import { ActionDesigner } from './actions/ActionDesigner';
import { DataDesigner } from './data/DataDesigner';
import { AdminGuidePanel, HelpTip } from '../guide/AdminGuide';
import { CustomOrganismDesigner } from './organisms/CustomOrganismDesigner';
import { ProcessDesigner } from './process/ProcessDesigner';
import { MenuDesigner } from './menu/MenuDesigner';
import { SecurityDesigner } from './security/SecurityDesigner';

type MetadataDesignerSection = 'overview' | 'data' | 'action' | 'process' | 'menu' | 'security' | 'organisms';

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
    id: 'process',
    title: 'Process Designer',
    description: 'Buat routing bisnis dan approval.',
    path: '/studio/metadata/process',
  },
  {
    id: 'menu',
    title: 'Menu Designer',
    description: 'Buat menu aplikasi runtime.',
    path: '/studio/metadata/menu',
  },
  {
    id: 'security',
    title: 'Security Designer',
    description: 'Atur role, permission, field, dan action access.',
    path: '/studio/metadata/security',
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
          <span className="redos-kicker">System Analyst Workspace</span>
          <h1>{activeDefinition?.title ?? 'Metadata Designer'} <HelpTip label="Advanced Mode" text="Area ini untuk System Analyst membuat blueprint aplikasi. Visual Builder tetap khusus UI metadata." /></h1>
          <p>{activeDefinition?.description ?? 'Pilih satu area metadata untuk dibuat atau dimodifikasi secara terpisah.'}</p>
        </div>
        <div className="redos-actions">
          <button data-redos-tooltip="Kembali ke Visual Builder untuk menyusun screen aplikasi." type="button" onClick={() => { window.location.href = '/studio'; }}>Back to Builder</button>
          <button data-redos-tooltip="Kelola reusable datasource untuk table, lookup, report, dan dashboard." type="button" onClick={() => { window.location.href = '/studio/query'; }}>Query Builder</button>
          <button data-redos-tooltip="Kelola generated API dan connector external." type="button" onClick={() => { window.location.href = '/studio/api'; }}>API Builder</button>
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
                description="Gunakan halaman ini untuk data, action, process, menu, security, dan reusable organism. Query/API punya builder sendiri."
                steps={[
                  'System Analyst membuat blueprint aplikasi, bukan mengedit screen satu per satu.',
                  'Data Designer: buat Object dan Attribute yang akan dipakai binding.',
                  'Action Designer: buat alur bisnis; button hanya memanggil Action.',
                  'Query Builder: buat datasource reusable untuk table, lookup, dashboard, dan report.',
                  'API Builder: kelola generated API dan connector, lalu panggil lewat Action step.',
                  'Process Designer: buat approval dan business routing, bukan URL routing.',
                  'Menu Designer: bentuk sidebar/menu runtime dari metadata.',
                  'Security Designer: atur role, permission, field access, dan Power User.',
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
                <div className="redos-metadata-nav-grid">
                  <button type="button" onClick={() => { window.location.href = '/studio/query'; }}>
                    <strong>Query Builder</strong>
                    <span>Datasource, filter, sort, dan output fields.</span>
                  </button>
                  <button type="button" onClick={() => { window.location.href = '/studio/api'; }}>
                    <strong>API Builder</strong>
                    <span>Generated API dan external connector.</span>
                  </button>
                </div>
              </section>
            </>
          ) : (
            <section className="redos-metadata-single-page">
              {activeSection === 'data' ? <DataDesigner /> : null}
              {activeSection === 'action' ? <ActionDesigner /> : null}
              {activeSection === 'process' ? <ProcessDesigner /> : null}
              {activeSection === 'menu' ? <MenuDesigner /> : null}
              {activeSection === 'security' ? <SecurityDesigner /> : null}
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
        <button type="button" onClick={() => { window.location.href = '/studio/query'; }}>
          <strong>Query Builder</strong>
          <span>Datasource capability</span>
        </button>
        <button type="button" onClick={() => { window.location.href = '/studio/api'; }}>
          <strong>API Builder</strong>
          <span>API and connector capability</span>
        </button>
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

  if (pathname.startsWith('/studio/metadata/process')) {
    return 'process';
  }

  if (pathname.startsWith('/studio/metadata/menu')) {
    return 'menu';
  }

  if (pathname.startsWith('/studio/metadata/security')) {
    return 'security';
  }

  if (pathname.startsWith('/studio/metadata/organisms')) {
    return 'organisms';
  }

  return 'overview';
}
