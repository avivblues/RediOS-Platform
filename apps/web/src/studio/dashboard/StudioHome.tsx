import type { ApplicationDefinition, EntityDefinition, MetadataDefinition } from '@redios/shared';
import { Button } from '../../components/atomic/atoms/Atoms';
import { Panel } from '../../components/atomic/organisms/Organisms';
import type { MetadataDebugTree } from '../../core/api/metadata-client';
import type { ExplorerSelection } from '../explorer/ApplicationExplorer';
import { humanizeCode, humanizeMetadata } from '../humanizer/HumanizerEngine';
import { ApplicationHealthIndicator, applicationHealthChecks } from '../readiness/ApplicationHealthIndicator';
import { term, terminologyMode } from '../terminology/terminology.service';

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
  const mode = terminologyMode(false);

  return (
    <div className="studio-home">
      <section className="studio-hero">
        <div>
          <span className="studio-kicker">Welcome to RediOS Studio</span>
          <h2>Customize enterprise applications without editing code.</h2>
          <p className="studio-muted">Choose an application, update its experience, preview impact, then launch safely through guided checks.</p>
        </div>
        <div className="studio-action-row">
          <Button onClick={() => onSelect({ type: 'CREATE_APPLICATION', code: 'CREATE_APPLICATION' })}>Create Application</Button>
          <Button variant="secondary" onClick={() => onSelect({ type: 'APPLICATION_BUILDER', code: tree.applications[0] ?? 'APPLICATIONS' })}>
            Modify Existing App
          </Button>
          <Button variant="secondary" onClick={() => onSelect({ type: 'TEMPLATES', code: 'TEMPLATES' })}>Import Template</Button>
        </div>
      </section>

      <div className="studio-home-grid">
        <MetricCard label="Applications" value={tree.applications.length} onClick={() => onSelect({ type: 'APPLICATION_BUILDER', code: tree.applications[0] ?? 'APPLICATIONS' })} />
        <MetricCard label={`${term('FORM', mode)}s`} value={tree.forms.length} onClick={() => onSelect({ type: 'FORMS', code: tree.forms[0] ?? 'FORMS' })} />
        <MetricCard label="Screens" value={tree.ui.length} onClick={() => onSelect({ type: 'PAGES', code: tree.ui[0] ?? 'PAGES' })} />
        <MetricCard label={term('WORKFLOW', mode)} value={tree.workflows.length} onClick={() => onSelect({ type: 'WORKFLOWS', code: tree.workflows[0] ?? 'WORKFLOWS' })} />
        <MetricCard label={term('INTEGRATION', mode)} value={tree.integrations.length + tree.connectors.length} onClick={() => onSelect({ type: 'INTEGRATIONS', code: tree.integrations[0] ?? 'INTEGRATIONS' })} />
        <MetricCard label={`${term('RUNTIME_PACKAGE', mode)} Status`} value={runtimeStatus ?? 'Not launched'} onClick={() => onSelect({ type: 'RUNTIME', code: 'RUNTIME' })} />
      </div>

      <Panel title="Your Applications">
        <div className="studio-card-grid">
          {applications.length === 0 ? (
            <EmptyWorkspaceCards onSelect={onSelect} />
          ) : null}
          {applications.map((metadata) => {
            const app = metadata.definition;
            const appEntities = entities.filter((entity) => app.entityCodes.includes(entity.code));
            const workflowCount = new Set(appEntities.map((entity) => entity.workflowCode).filter(Boolean)).size;
            const human = humanizeMetadata(app.code, 'APPLICATION', app.description);

            return (
              <article key={app.code} className="studio-app-card">
                <span className="studio-kicker">{human.icon}</span>
                <h3>{app.name || human.label}</h3>
                <p>{app.description ?? human.description}</p>
                <div className="studio-muted">{app.entityCodes.length} Data Objects</div>
                <div className="studio-muted">{tree.forms.length} Input Screens</div>
                <div className="studio-muted">{workflowCount} Processes</div>
                <ApplicationHealthIndicator
                  checks={applicationHealthChecks({
                    dataCount: app.entityCodes.length,
                    screenCount: tree.forms.length + tree.ui.length,
                    securityReady: true,
                    processCount: workflowCount,
                  })}
                />
                <strong>{app.enabled ? 'Published' : 'Draft'}</strong>
                <div className="studio-action-row">
                  <Button onClick={() => onSelect({ type: 'APPLICATION_BUILDER', code: app.code })}>Customize</Button>
                </div>
              </article>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

function EmptyWorkspaceCards({ onSelect }: { onSelect: (selection: ExplorerSelection) => void }) {
  const starters = ['Manage Products', 'Manage Customers', 'Manage Tasks', 'Start Blank'];

  return (
    <section className="studio-empty-workspace">
      <h3>What do you want to build?</h3>
      <div className="studio-card-grid">
        {starters.map((starter) => (
          <button key={starter} className="studio-ds-card studio-ds-card-interactive" type="button" onClick={() => onSelect({ type: 'CREATE_APPLICATION', code: 'CREATE_APPLICATION' })}>
            <strong>{starter}</strong>
            <span className="studio-muted">Start guided creation</span>
          </button>
        ))}
      </div>
    </section>
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
