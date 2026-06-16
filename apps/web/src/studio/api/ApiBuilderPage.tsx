import { ApiDesigner } from '../metadata/api/ApiDesigner';

export function ApiBuilderPage() {
  return (
    <main className="redos-builder-page">
      <header className="redos-builder-header">
        <div>
          <span className="redos-kicker">API Builder</span>
          <h1>API Capability Builder</h1>
          <p>Kelola generated API dan external connector secara terpisah dari Metadata Designer.</p>
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
            <p>Kelola runtime API dan connector per application.</p>
          </div>
          <nav className="redos-metadata-sidebar-nav">
            <button className="redos-metadata-sidebar-active" type="button">
              <strong>API Builder</strong>
              <span>Generated API dan external connector</span>
            </button>
            <button type="button" onClick={() => { window.location.href = '/studio/query'; }}>
              <strong>Query Builder</strong>
              <span>Datasource, filter, sort, dan output fields</span>
            </button>
            <button type="button" onClick={() => { window.location.href = '/studio/metadata'; }}>
              <strong>Metadata Designer</strong>
              <span>Data, Action, Process, Menu, Security</span>
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
