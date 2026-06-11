import type { DesignerPreviewResult } from '../../core/api/designer-client';
import { Badge } from '../../components/atomic/atoms/Atoms';

const impactRows = [
  { label: 'FORM', match: 'FORM' },
  { label: 'UI', match: 'UI' },
  { label: 'SECURITY', match: 'SECURITY' },
  { label: 'DEPENDENCY', match: 'DEPENDENCY' },
];

export function ImpactPreview({ preview }: { preview?: DesignerPreviewResult }) {
  const hasBreaking = preview?.dependencies.impacts.some((impact) => impact.impact === 'BREAKING') ?? false;

  return (
    <section className="studio-card">
      <div className="studio-section-header">
        <h4>Impact Analysis</h4>
        <Badge tone={!preview ? 'info' : preview.valid && !hasBreaking ? 'success' : 'warning'}>
          {!preview ? 'No preview' : preview.valid && !hasBreaking ? 'Safe' : 'Review'}
        </Badge>
      </div>
      {impactRows.map((row) => {
        const affected = preview?.affected.some((item) => item.includes(row.match));
        const breaking = preview?.dependencies.impacts.find((impact) => impact.type.includes(row.match) && impact.impact === 'BREAKING');

        return (
          <div key={row.label} className={breaking ? 'studio-impact studio-impact-breaking' : 'studio-impact studio-impact-info'}>
            <strong>{breaking ? '!' : 'OK'} {row.label}</strong>
            <span>{breaking?.reason ?? (affected ? 'Affected application pieces are safe to preview.' : 'No issue')}</span>
          </div>
        );
      })}
    </section>
  );
}
