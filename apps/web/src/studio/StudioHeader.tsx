import type { ApplicationDefinition, MetadataDefinition } from '@redios/shared';
import { Button, Select } from '../components/atomic/atoms/Atoms';
import type { RuntimeContext } from '../core/renderer/runtime-types';
import { humanizeCode } from './humanizer/HumanizerEngine';
import type { StudioMode } from './mode/studio-mode';

export function StudioHeader({
  context,
  themeCode,
  applications,
  selectedApplicationCode,
  mode,
  onApplicationSelect,
  onModeChange,
  onSimulate,
  canSimulate,
}: {
  context: RuntimeContext;
  themeCode: string;
  applications: Array<MetadataDefinition<ApplicationDefinition>>;
  selectedApplicationCode?: string;
  mode: StudioMode;
  onApplicationSelect: (applicationCode: string) => void;
  onModeChange: (mode: StudioMode) => void;
  onSimulate: () => void;
  canSimulate: boolean;
}) {
  const applicationOptions = applications.map((metadata) => metadata.definition.code);
  const activeApplication = selectedApplicationCode ?? context.applicationCode;

  return (
    <div className="studio-section-header">
      <div>
        <h1>RediOS Studio</h1>
        <div className="studio-muted">
          No-code application studio | Theme: {humanizeCode(themeCode)} | App: {humanizeCode(activeApplication)}
        </div>
      </div>
      <div className="studio-header-actions">
        {applicationOptions.length > 0 ? (
          <Select value={activeApplication} options={applicationOptions} onChange={onApplicationSelect} />
        ) : null}
        <Button variant="secondary" onClick={() => onModeChange(mode === 'EXPERT' ? 'SIMPLE' : 'EXPERT')}>
          {mode === 'EXPERT' ? 'Expert Mode' : 'Simple Mode'}
        </Button>
        <Button variant="secondary" onClick={onSimulate} disabled={!canSimulate}>
          Preview
        </Button>
      </div>
    </div>
  );
}
