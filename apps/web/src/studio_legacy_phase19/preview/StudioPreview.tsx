import type { DesignerPreviewResult } from '../../core/api/designer-client';
import type { RuntimeForm, ResolvedUIPage } from '../../core/renderer/runtime-types';
import { Badge } from '../../components/atomic/atoms/Atoms';
import { Panel } from '../../components/atomic/organisms/Organisms';
import { FormRenderer } from '../../renderer/FormRenderer';
import { PageRenderer } from '../../renderer/PageRenderer';
import { ChangeImpactPreview } from './ChangeImpactPreview';
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
    <Panel title="Application Preview">
      <div className="studio-action-row">
        <Badge tone={preview?.valid ? 'success' : 'info'}>{preview ? (preview.valid ? 'VALID' : 'NEEDS ATTENTION') : 'NO PREVIEW'}</Badge>
        {preview?.affected.map((item) => <Badge key={item}>{item}</Badge>)}
      </div>
      {preview ? (
        <div className="studio-preview-grid">
          <ImpactPreview preview={preview} />
          <ChangeImpactPreview preview={preview} />
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
            <h4>Launch Simulation</h4>
            <div className="studio-impact studio-impact-info">Simulation completed through the existing Simulation Engine.</div>
            <div className="studio-muted">Use Expert Mode for deeper technical details.</div>
          </section>
        </div>
      ) : null}
      <section className="studio-card">
        <div className="studio-section-header">
          <h4>Desktop Preview</h4>
          <span className="studio-muted">Rendered from current application setup</span>
        </div>
        <div className="studio-desktop-preview">
          <FormRenderer form={form} />
          <PageRenderer page={page} />
        </div>
      </section>
      <section className="studio-card">
        <div className="studio-section-header">
          <h4>Mobile Preview</h4>
          <span className="studio-muted">Adaptive experience placeholder</span>
        </div>
        <div className="studio-mobile-preview">Mobile layout follows the adaptive experience settings when available.</div>
      </section>
    </Panel>
  );
}
