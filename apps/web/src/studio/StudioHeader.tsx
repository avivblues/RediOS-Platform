import { Button } from '../components/atomic/atoms/Atoms';
import type { RuntimeContext } from '../core/renderer/runtime-types';

export function StudioHeader({
  context,
  themeCode,
  navigationCode,
  onSimulate,
  canSimulate,
}: {
  context: RuntimeContext;
  themeCode: string;
  navigationCode: string;
  onSimulate: () => void;
  canSimulate: boolean;
}) {
  return (
    <div className="studio-section-header">
      <div>
        <h1>RediOS Studio</h1>
        <div className="studio-muted">
          Metadata editor | Theme: {themeCode} | Navigation: {navigationCode} | App: {context.applicationCode}
        </div>
      </div>
      <Button variant="secondary" onClick={onSimulate} disabled={!canSimulate}>
        Simulate
      </Button>
    </div>
  );
}
