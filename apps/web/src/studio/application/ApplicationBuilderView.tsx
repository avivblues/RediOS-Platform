import type { ApplicationDefinition, EntityDefinition, MetadataDefinition } from '@redios/shared';
import { Button } from '../../components/atomic/atoms/Atoms';
import { Panel } from '../../components/atomic/organisms/Organisms';
import type { MetadataDebugTree } from '../../core/api/metadata-client';
import type { ExplorerSelection } from '../explorer/ApplicationExplorer';
import { GuidedHint } from '../help/GuidedHint';
import { HelpTooltip } from '../help/HelpTooltip';
import { LearningPanel } from '../help/LearningPanel';
import { StudioLearningCoach } from '../help/StudioLearningCoach';
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
          <p className="studio-muted">{definition.description ?? 'Choose what information this app stores, how users see it, and when it is ready to launch.'}</p>
        </div>
      </section>
      <LearningPanel title="How to modify an existing app" summary="Start with the business information, then adjust the screens users interact with. You can preview impact before launch.">
        <GuidedHint title="Recommended path">Open Data Object first, review the information it stores, then open Input Screens to change how users enter it.</GuidedHint>
      </LearningPanel>
      <StudioLearningCoach
        title="How to modify this application"
        purpose="Use this page like a map. Pick the part of the app you want to change, then RediOS opens the right builder."
        steps={[
          { title: '1. Data Object', body: 'Use this to understand what information the app stores.' },
          { title: '2. Input Screens', body: 'Use this to change what users see when adding or editing information.' },
          { title: '3. Process', body: 'Use this when work needs approval, status changes, or lifecycle steps.' },
          { title: '4. Permissions', body: 'Use this to control who can see or edit the app.' },
        ]}
        currentTip="If you are not sure, start with Data Object, then open Input Screens."
      />
      <Panel title="Builder">
        <div className="studio-card-grid">
          <BuilderCard title="Data Object" category="Data" description="The thing your business manages, such as Product, Asset, or Customer." help="Start here when you want to add or understand information." onClick={() => onSelect({ type: 'ENTITY', code: definition.entityCodes[0] ?? tree.entities[0] ?? 'ENTITY' })} />
          <BuilderCard title="Input Screens" category="Experience" description="Where users enter and update information." help="Open this when users need a better form or layout." onClick={() => onSelect({ type: 'FORMS', code: tree.forms[0] ?? 'FORMS' })} />
          <BuilderCard title="Pages" category="Experience" description="The app screens users navigate to." help="Use pages to organize lists, forms, and dashboards." onClick={() => onSelect({ type: 'PAGES', code: tree.ui[0] ?? 'PAGES' })} />
          <BuilderCard title="Process" category="Automation" description="How work moves from one step to another." help="Use this for approval, status, and lifecycle flow." onClick={() => onSelect({ type: 'WORKFLOWS', code: workflowCode ?? 'WORKFLOWS' })} />
          <BuilderCard title="Connector" category="Automation" description="How this app exchanges data with another system." help="Use this for webhook, API, and external system connections." onClick={() => onSelect({ type: 'INTEGRATIONS', code: tree.integrations[0] ?? 'INTEGRATIONS' })} />
          <BuilderCard title="Permissions" category="Security" description="Who can see, edit, or launch parts of this app." help="Use permissions to keep business data safe." onClick={() => onSelect({ type: 'SECURITY', code: tree.securityPolicies[0] ?? 'SECURITY' })} />
        </div>
      </Panel>
      <Panel title="Data Objects">
        <div className="studio-card-grid">
          {appEntities.map((entity) => (
            <button key={entity.code} className="studio-app-card" onClick={() => onSelect({ type: 'ENTITY', code: entity.code })}>
              <span className="studio-kicker">Data Object</span>
              <h3>{humanizeCode(entity.code)}</h3>
              <p className="studio-muted">{entity.fieldCodes.length} information items</p>
              <strong>Open Input Screen Builder</strong>
            </button>
          ))}
          {appEntities.length === 0 ? (
            <GuidedHint title="No Data Objects yet">Create a Data Object before changing screens. A Data Object describes the business information this app manages.</GuidedHint>
          ) : null}
        </div>
      </Panel>
    </div>
  );
}

function BuilderCard({
  category,
  title,
  description,
  help,
  onClick,
}: {
  category: string;
  title: string;
  description: string;
  help: string;
  onClick: () => void;
}) {
  return (
    <article className="studio-app-card">
      <span className="studio-kicker">{category}</span>
      <h3>
        {title}
        <HelpTooltip label={title}>{help}</HelpTooltip>
      </h3>
      <p>{description}</p>
      <Button onClick={onClick}>Open</Button>
    </article>
  );
}
