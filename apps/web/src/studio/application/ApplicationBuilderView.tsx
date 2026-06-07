import type { ApplicationDefinition, EntityDefinition, MetadataDefinition } from '@redios/shared';
import { Panel } from '../../components/atomic/organisms/Organisms';
import type { MetadataDebugTree } from '../../core/api/metadata-client';
import type { ExplorerSelection } from '../explorer/ApplicationExplorer';
import { humanizeCode } from '../humanizer/HumanizerEngine';

export function ApplicationBuilderView({
  application,
  entities,
  tree,
  onSelect,
}: {
  application: MetadataDefinition<ApplicationDefinition>;
  entities: EntityDefinition[];
  tree: MetadataDebugTree;
  onSelect: (selection: ExplorerSelection) => void;
}) {
  const definition = application.definition;
  const appEntities = entities.filter((entity) => definition.entityCodes.includes(entity.code));
  const workflowCode = appEntities.find((entity) => entity.workflowCode)?.workflowCode ?? tree.workflows[0];

  return (
    <div className="studio-app-builder">
      <div className="studio-breadcrumb">
        <span>Studio</span>
        <span>Applications</span>
        <strong>{definition.name || humanizeCode(definition.code)}</strong>
      </div>
      <section className="studio-hero">
        <div>
          <span className="studio-kicker">Customize your application</span>
          <h2>{definition.name || humanizeCode(definition.code)}</h2>
          <p className="studio-muted">{definition.description ?? 'Configure data, experience, automation, integration, and access from metadata.'}</p>
        </div>
      </section>
      <Panel title="Builder">
        <div className="studio-card-grid">
          <BuilderCard title="Data Model" category="Data" description="Define information your app stores." onClick={() => onSelect({ type: 'ENTITY', code: definition.entityCodes[0] ?? tree.entities[0] ?? 'ENTITY' })} />
          <BuilderCard title="Forms" category="Experience" description="Design user input screens." onClick={() => onSelect({ type: 'FORMS', code: tree.forms[0] ?? 'FORMS' })} />
          <BuilderCard title="Pages" category="Experience" description="Build application pages." onClick={() => onSelect({ type: 'PAGES', code: tree.ui[0] ?? 'PAGES' })} />
          <BuilderCard title="Workflow" category="Automation" description="Configure business flow." onClick={() => onSelect({ type: 'WORKFLOWS', code: workflowCode ?? 'WORKFLOWS' })} />
          <BuilderCard title="Integration" category="Automation" description="Connect external systems." onClick={() => onSelect({ type: 'INTEGRATIONS', code: tree.integrations[0] ?? 'INTEGRATIONS' })} />
          <BuilderCard title="Access Control" category="Security" description="Manage policies and permissions." onClick={() => onSelect({ type: 'SECURITY', code: tree.securityPolicies[0] ?? 'SECURITY' })} />
        </div>
      </Panel>
    </div>
  );
}

function BuilderCard({
  category,
  title,
  description,
  onClick,
}: {
  category: string;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button className="studio-app-card" onClick={onClick}>
      <span className="studio-kicker">{category}</span>
      <h3>{title}</h3>
      <p>{description}</p>
    </button>
  );
}
