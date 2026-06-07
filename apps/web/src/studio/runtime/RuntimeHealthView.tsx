import type { MetadataDefinition, RuntimePackageDefinition } from '@redios/shared';
import { Badge } from '../../components/atomic/atoms/Atoms';
import { Panel } from '../../components/atomic/organisms/Organisms';
import { EmptyState } from '../empty/EmptyState';

export function RuntimeHealthView({
  runtimePackage,
}: {
  runtimePackage?: MetadataDefinition<RuntimePackageDefinition> | null;
}) {
  const definition = runtimePackage?.definition;

  if (!definition) {
    return (
      <Panel title="Runtime Health">
        <EmptyState
          title="No active runtime package yet"
          description="Publish metadata or run the Runtime Compiler to create an active package."
        />
      </Panel>
    );
  }

  return (
    <Panel title="Runtime Health">
      <div className="studio-section-header">
        <div>
          <span className="studio-kicker">Active Runtime Package</span>
          <h3>{definition.code}</h3>
        </div>
        <Badge tone={definition.status === 'ACTIVE' ? 'success' : 'warning'}>{definition.status}</Badge>
      </div>
      <div className="studio-runtime-grid">
        <RuntimeMetric label="Version" value={definition.metadataVersion} />
        <RuntimeMetric label="Entities" value={Object.keys(definition.content.entities).length} />
        <RuntimeMetric label="Forms" value={Object.keys(definition.content.forms).length} />
        <RuntimeMetric label="Views" value={Object.keys(definition.content.views).length} />
        <RuntimeMetric label="Workflow" value={Object.keys(definition.content.workflows).length} />
        <RuntimeMetric label="Checksum" value={definition.checksum} />
      </div>
    </Panel>
  );
}

function RuntimeMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="studio-card">
      <span className="studio-muted">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
