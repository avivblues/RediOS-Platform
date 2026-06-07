import { Button } from '../../components/atomic/atoms/Atoms';
import { Panel } from '../../components/atomic/organisms/Organisms';
import { humanizeCode } from '../humanizer/HumanizerEngine';
import { studioTemplatePackages } from './template-packages';

export function TemplateGallery() {
  return (
    <Panel title="Template Gallery">
      <p className="studio-muted">Templates are metadata packages that can be imported through Designer workflows.</p>
      <div className="studio-card-grid">
        {studioTemplatePackages.map((template) => (
          <article key={template.code} className="studio-card">
            <span className="studio-kicker">{humanizeCode(template.code)}</span>
            <h3>{template.name}</h3>
            <p>{template.description}</p>
            <div className="studio-muted">{template.entities.length} entities: {template.entities.map(humanizeCode).join(', ') || '-'}</div>
            <div className="studio-muted">{template.workflows.length} workflows</div>
            <div className="studio-muted">{template.forms.length} forms</div>
            <Button variant="secondary">Preview Package</Button>
          </article>
        ))}
      </div>
    </Panel>
  );
}
