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
      <Panel title="Launch Health">
        <EmptyState
          title="Belum ada Launch Version aktif"
          description="Launch aplikasi untuk membuat versi aktif yang siap digunakan."
        />
      </Panel>
    );
  }

  return (
    <Panel title="Launch Health">
      <div className="studio-section-header">
        <div>
          <span className="studio-kicker">Active Launch Version</span>
          <h3>{definition.code}</h3>
        </div>
        <Badge tone={definition.status === 'ACTIVE' ? 'success' : 'warning'}>{definition.status}</Badge>
      </div>
      <div className="studio-runtime-grid">
        <RuntimeMetric label="Version" value={definition.metadataVersion} />
        <RuntimeMetric label="Data Object" value={Object.keys(definition.content.entities).length} />
        <RuntimeMetric label="Screen" value={Object.keys(definition.content.forms).length} />
        <RuntimeMetric label="List Screen" value={Object.keys(definition.content.views).length} />
        <RuntimeMetric label="Process" value={Object.keys(definition.content.workflows).length} />
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
