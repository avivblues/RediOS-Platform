import type { ApplicationDefinition, EntityDefinition, MetadataDefinition } from '@redios/shared';
import { Button } from '../../components/atomic/atoms/Atoms';
import { Panel } from '../../components/atomic/organisms/Organisms';
import type { MetadataDebugTree } from '../../core/api/metadata-client';
import type { ExplorerSelection } from '../explorer/ApplicationExplorer';
import { humanizeCode, humanizeMetadata } from '../humanizer/HumanizerEngine';

export function StudioHome({
  tree,
  applications,
  entities,
  runtimeStatus,
  onSelect,
}: {
  tree: MetadataDebugTree;
  applications: Array<MetadataDefinition<ApplicationDefinition>>;
  entities: EntityDefinition[];
  runtimeStatus?: string;
  onSelect: (selection: ExplorerSelection) => void;
}) {
  return (
    <div className="studio-home">
      <section className="studio-hero">
        <div>
          <span className="studio-kicker">Welcome back</span>
          <h2>What do you want to build?</h2>
          <p className="studio-muted">Build enterprise apps from metadata, preview impact, then publish through the Designer Engine.</p>
        </div>
        <div className="studio-action-row">
          <Button onClick={() => onSelect({ type: 'WIZARD', code: 'GUIDED_APP_BUILDER' })}>Create Application</Button>
          <Button variant="secondary" onClick={() => onSelect({ type: 'APPLICATION', code: tree.applications[0] ?? 'APPLICATIONS' })}>
            Modify Existing App
          </Button>
          <Button variant="secondary" onClick={() => onSelect({ type: 'TEMPLATES', code: 'TEMPLATES' })}>Import Template</Button>
        </div>
      </section>

      <div className="studio-home-grid">
        <MetricCard label="Applications" value={tree.applications.length} onClick={() => onSelect({ type: 'APPLICATION', code: tree.applications[0] ?? 'APPLICATIONS' })} />
        <MetricCard label="Forms" value={tree.forms.length} onClick={() => onSelect({ type: 'FORMS', code: tree.forms[0] ?? 'FORMS' })} />
        <MetricCard label="Pages" value={tree.ui.length} onClick={() => onSelect({ type: 'PAGES', code: tree.ui[0] ?? 'PAGES' })} />
        <MetricCard label="Workflow" value={tree.workflows.length} onClick={() => onSelect({ type: 'WORKFLOWS', code: tree.workflows[0] ?? 'WORKFLOWS' })} />
        <MetricCard label="Integration" value={tree.integrations.length + tree.connectors.length} onClick={() => onSelect({ type: 'INTEGRATIONS', code: tree.integrations[0] ?? 'INTEGRATIONS' })} />
        <MetricCard label="Runtime Package Status" value={runtimeStatus ?? 'Not compiled'} onClick={() => onSelect({ type: 'RUNTIME', code: 'RUNTIME' })} />
      </div>

      <Panel title="Your Applications">
        <div className="studio-card-grid">
          {applications.map((metadata) => {
            const app = metadata.definition;
            const appEntities = entities.filter((entity) => app.entityCodes.includes(entity.code));
            const workflowCount = new Set(appEntities.map((entity) => entity.workflowCode).filter(Boolean)).size;
            const human = humanizeMetadata(app.code, 'APPLICATION', app.description);

            return (
              <button key={app.code} className="studio-app-card" onClick={() => onSelect({ type: 'APPLICATION', code: app.code })}>
                <span className="studio-kicker">{human.icon}</span>
                <h3>{app.name || human.label}</h3>
                <p>{app.description ?? human.description}</p>
                <div className="studio-muted">{app.entityCodes.length} entities</div>
                <div className="studio-muted">{workflowCount} workflows</div>
                <strong>{app.enabled ? 'Published' : 'Draft'}</strong>
              </button>
            );
          })}
          {applications.length === 0 ? <div className="studio-empty">No application metadata registered yet.</div> : null}
        </div>
      </Panel>
    </div>
  );
}

function MetricCard({ label, value, onClick }: { label: string; value: string | number; onClick: () => void }) {
  return (
    <button className="studio-metric-card" onClick={onClick}>
      <span className="studio-muted">{label}</span>
      <strong>{typeof value === 'number' ? value.toLocaleString() : humanizeCode(value)}</strong>
    </button>
  );
}
