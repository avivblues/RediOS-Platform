import { ActionDesigner } from './actions/ActionDesigner';
import { ApiDesigner } from './api/ApiDesigner';
import { DataDesigner } from './data/DataDesigner';

export function MetadataDesignerPage() {
  return (
    <main className="redos-builder-page">
      <header className="redos-builder-header">
        <div>
          <span className="redos-kicker">Advanced Mode</span>
          <h1>Metadata Designer</h1>
          <p>Technical workspace for generated DATA, ACTION, and API metadata.</p>
        </div>
        <button type="button" onClick={() => { window.location.href = '/studio'; }}>Back to Builder</button>
      </header>

      <section className="redos-metadata-map">
        <strong>METADATA DESIGNER</strong>
        <div>
          <span>DATA<br /><small>schema</small></span>
          <span>EVENT<br /><small>logic</small></span>
          <span>API<br /><small>endpoint</small></span>
        </div>
      </section>

      <section className="redos-metadata-grid">
        <DataDesigner />
        <ActionDesigner />
        <ApiDesigner />
      </section>
    </main>
  );
}
