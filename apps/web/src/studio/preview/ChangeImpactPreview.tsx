import type { DesignerPreviewResult } from '../../core/api/designer-client';
import { StudioBadge } from '../design-system/StudioDesignSystem';

export function ChangeImpactPreview({ preview }: { preview?: DesignerPreviewResult }) {
  const impacts = preview?.dependencies.impacts ?? [];
  const screens = impacts.filter((impact) => impact.type.includes('FORM') || impact.type.includes('UI') || impact.type.includes('VIEW')).length;
  const processes = impacts.filter((impact) => impact.type.includes('WORKFLOW') || impact.type.includes('PROCESS')).length;
  const reports = impacts.filter((impact) => impact.type.includes('REPORT') || impact.type.includes('QUERY')).length;
  const safe = Boolean(preview?.valid && preview.dependencies.safe && impacts.every((impact) => impact.impact !== 'BREAKING'));

  return (
    <section className="studio-card" aria-label="Change impact preview">
      <div className="studio-section-header">
        <h4>Change Impact</h4>
        <StudioBadge tone={!preview ? 'info' : safe ? 'success' : 'warning'}>{!preview ? 'Preview needed' : safe ? 'Safe' : 'Review'}</StudioBadge>
      </div>
      {!preview ? (
        <p className="studio-muted">Preview this change to see where it is used.</p>
      ) : (
        <>
          <p>This change is used by:</p>
          <div className="studio-impact-summary">
            <strong>Screens: {screens}</strong>
            <strong>Processes: {processes}</strong>
            <strong>Reports: {reports}</strong>
          </div>
          <div className={safe ? 'studio-impact studio-impact-info' : 'studio-impact studio-impact-warning'}>
            Safe to continue? {safe ? 'YES' : 'NO'}
          </div>
        </>
      )}
    </section>
  );
}
