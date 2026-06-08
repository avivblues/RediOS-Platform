import { Button } from '../../components/atomic/atoms/Atoms';
import type { ExplorerSelection } from '../explorer/ApplicationExplorer';
import type { JourneyStepDefinition } from './JourneyDefinition';

export function JourneyStep({
  step,
  onSelect,
}: {
  step: JourneyStepDefinition;
  onSelect: (selection: ExplorerSelection) => void;
}) {
  return (
    <button className={step.complete ? 'studio-journey-step studio-journey-step-complete' : 'studio-journey-step'} type="button" onClick={() => onSelect(step.selection)}>
      <span>{step.complete ? '✓' : '○'}</span>
      <div>
        <strong>{step.label}</strong>
        <p>{step.description}</p>
      </div>
    </button>
  );
}

export function JourneyNextActionCard({
  title,
  description,
  buttonLabel,
  tips,
  onClick,
}: {
  title: string;
  description: string;
  buttonLabel: string;
  tips: string[];
  onClick: () => void;
}) {
  return (
    <aside className="studio-assistant-panel" aria-label="Need help">
      <span className="studio-kicker">Need help?</span>
      <h3>{title}</h3>
      <p>{description}</p>
      <Button onClick={onClick} tooltip={description}>{buttonLabel}</Button>
      <div>
        <strong>Tips</strong>
        <ul>
          {tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
