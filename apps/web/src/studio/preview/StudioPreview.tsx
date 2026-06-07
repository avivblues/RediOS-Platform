import type { DesignerPreviewResult } from '../../core/api/designer-client';
import type { RuntimeForm, ResolvedUIPage } from '../../core/renderer/runtime-types';
import { Badge } from '../../components/atomic/atoms/Atoms';
import { Panel } from '../../components/atomic/organisms/Organisms';
import { FormRenderer } from '../../renderer/FormRenderer';
import { PageRenderer } from '../../renderer/PageRenderer';
import { ImpactPreview } from './ImpactPreview';

export function StudioPreview({
  preview,
  form,
  page,
}: {
  preview?: DesignerPreviewResult;
  form?: RuntimeForm;
  page?: ResolvedUIPage;
}) {
  return (
    <Panel title="Preview Engine">
      <div className="studio-action-row">
        <Badge tone={preview?.valid ? 'success' : 'info'}>{preview ? (preview.valid ? 'VALID' : 'NEEDS ATTENTION') : 'NO PREVIEW'}</Badge>
        {preview?.affected.map((item) => <Badge key={item}>{item}</Badge>)}
      </div>
      {preview ? (
        <div className="studio-preview-grid">
          <ImpactPreview preview={preview} />
          <section className="studio-card">
            <h4>Validation</h4>
            <div>Errors: {preview.validation.errors}</div>
            <div>Warnings: {preview.validation.warnings}</div>
            {preview.validation.issues.map((issue) => (
              <div key={`${issue.code}:${issue.path}`} className="studio-muted">
                {issue.code}: {issue.message}
              </div>
            ))}
          </section>
          <section className="studio-card">
            <h4>Dependency Impact</h4>
            {preview.dependencies.impacts.length === 0 ? <div className="studio-muted">No impacts reported.</div> : null}
            {preview.dependencies.impacts.map((impact) => (
              <div key={`${impact.type}:${impact.code}:${impact.reason}`} className={`studio-impact studio-impact-${impact.impact.toLowerCase()}`}>
                <strong>{impact.impact}</strong> {impact.type}:{impact.code} - {impact.reason}
              </div>
            ))}
          </section>
          <section className="studio-card">
            <h4>Simulation</h4>
            <pre>{JSON.stringify(preview.simulation, null, 2)}</pre>
          </section>
        </div>
      ) : null}
      <div className="studio-preview-grid">
        <FormRenderer form={form} />
        <PageRenderer page={page} />
      </div>
    </Panel>
  );
}
