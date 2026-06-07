import { Panel } from '../../components/atomic/organisms/Organisms';
import type { ResolvedUIPage } from '../../core/renderer/runtime-types';
import { PageRenderer } from '../../renderer/PageRenderer';

export function PageBuilder({ page }: { page?: ResolvedUIPage }) {
  return (
    <Panel title="Page Builder">
      <div className="studio-muted">Page layout is resolved from UI composition metadata.</div>
      <PageRenderer page={page} />
    </Panel>
  );
}
