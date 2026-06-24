import { ApiDesigner } from '../metadata/api/ApiDesigner';

export function ApiBuilderPage() {
  return (
    <main className="redos-builder-page">
      <header className="redos-builder-header">
        <div>
          <span className="redos-kicker">API Builder</span>
          <h1>API Capability Builder</h1>
        </div>
        <div className="redos-actions">
          <button type="button" onClick={() => { window.location.href = '/studio'; }}>Back to Builder</button>
          <button type="button" onClick={() => { window.location.href = '/studio/metadata'; }}>Metadata</button>
          <button type="button" onClick={() => { window.location.href = '/studio/query'; }}>Query Builder</button>
        </div>
      </header>

      <section className="redos-metadata-shell">
        <aside className="redos-metadata-sidebar" aria-label="API Builder navigation">
          <div className="redos-panel-heading">
            <span className="redos-kicker">Capability</span>
            <h3>API Menu</h3>
          </div>
          <nav className="redos-metadata-sidebar-nav">
            <button className="redos-metadata-sidebar-active" type="button">
              <strong>API Builder</strong>
              <span>Runtime API & connectors</span>
            </button>
            <button type="button" onClick={() => { window.location.href = '/studio/query'; }}>
              <strong>Query Builder</strong>
              <span>Datasources</span>
            </button>
            <button type="button" onClick={() => { window.location.href = '/studio/metadata'; }}>
              <strong>Metadata Designer</strong>
              <span>Data, action, process</span>
            </button>
          </nav>
        </aside>

        <div className="redos-metadata-content">
          <ApiDesigner />
        </div>
      </section>
    </main>
  );
}
