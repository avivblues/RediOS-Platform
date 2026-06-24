import { useState } from 'react';
import { formatPublishResult, publishActiveApplicationFromStore } from '../api/studio-publish.api';
import { ActionDesigner } from './actions/ActionDesigner';
import { DataDesigner } from './data/DataDesigner';
import { HelpTip } from '../guide/AdminGuide';
import { CustomOrganismDesigner } from './organisms/CustomOrganismDesigner';
import { ProcessDesigner } from './process/ProcessDesigner';
import { MenuDesigner } from './menu/MenuDesigner';
import { SecurityDesigner } from './security/SecurityDesigner';
import { WorkspaceDesigner } from './workspace/WorkspaceDesigner';

type MetadataDesignerSection = 'overview' | 'data' | 'action' | 'process' | 'menu' | 'security' | 'organisms' | 'workspace';

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
    id: 'workspace',
    title: 'Workspace Designer',
    description: 'Edit persona workspace panels, inbox layout, and capability gates.',
    path: '/studio/metadata/workspace',
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
  const [publishStatus, setPublishStatus] = useState<string | undefined>();

  async function publishToKernel() {
    setPublishStatus('Publishing...');

    try {
      const result = await publishActiveApplicationFromStore();
      setPublishStatus(formatPublishResult(result));
    } catch (error) {
      setPublishStatus(error instanceof Error ? error.message : 'Publish failed.');
    }
  }

  return (
    <main className="redos-builder-page">
      <header className="redos-builder-header">
        <div>
          <span className="redos-kicker">System Analyst Workspace</span>
          <h1>{activeDefinition?.title ?? 'Metadata Designer'} <HelpTip label="Metadata Designer" text="Blueprint aplikasi: data, action, process, menu, security. Detail: docs/handbook/02." /></h1>
        </div>
        <div className="redos-actions">
          <button className="redos-launch-action" type="button" onClick={() => { void publishToKernel(); }}>Publish to Kernel</button>
          <button data-redos-tooltip="Kembali ke Visual Builder untuk menyusun screen aplikasi." type="button" onClick={() => { window.location.href = '/studio'; }}>Back to Builder</button>
          <button data-redos-tooltip="Kelola reusable datasource untuk table, lookup, report, dan dashboard." type="button" onClick={() => { window.location.href = '/studio/query'; }}>Query Builder</button>
          <button data-redos-tooltip="Kelola generated API dan connector external." type="button" onClick={() => { window.location.href = '/studio/api'; }}>API Builder</button>
          <button data-redos-tooltip="Mulai aplikasi baru dari experience/template." type="button" onClick={() => { window.location.href = '/studio/create'; }}>Create App</button>
        </div>
      </header>

      {publishStatus ? <p className="redos-metadata-status redos-builder-status">{publishStatus}</p> : null}

      <section className="redos-metadata-shell">
        <MetadataDesignerSidebar activeSection={activeSection} />

        <div className="redos-metadata-content">
          {activeSection === 'overview' ? (
            <section className="redos-metadata-map" aria-label="Metadata designer menu">
              <div className="redos-panel-heading">
                <span className="redos-kicker">Metadata Designer</span>
                <h3>Pilih designer</h3>
              </div>
              <MetadataDesignerNav activeSection={activeSection} />
              <div className="redos-metadata-nav-grid">
                <button type="button" onClick={() => { window.location.href = '/studio/query'; }}>
                  <strong>Query Builder</strong>
                  <span>Datasource untuk table & report</span>
                </button>
                <button type="button" onClick={() => { window.location.href = '/studio/api'; }}>
                  <strong>API Builder</strong>
                  <span>Runtime API & connector</span>
                </button>
              </div>
            </section>
          ) : (
            <section className="redos-metadata-single-page">
              {activeSection === 'data' ? <DataDesigner /> : null}
              {activeSection === 'action' ? <ActionDesigner /> : null}
              {activeSection === 'process' ? <ProcessDesigner /> : null}
              {activeSection === 'workspace' ? <WorkspaceDesigner /> : null}
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
      </div>

      <nav className="redos-metadata-sidebar-nav">
        <button
          className={activeSection === 'overview' ? 'redos-metadata-sidebar-active' : ''}
          type="button"
          onClick={() => { window.location.href = '/studio/metadata'; }}
        >
          <strong>Overview</strong>
          <span>Designer cards</span>
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

  if (pathname.startsWith('/studio/metadata/workspace')) {
    return 'workspace';
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
