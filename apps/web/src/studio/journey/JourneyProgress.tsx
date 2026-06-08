import type { ExplorerSelection } from '../explorer/ApplicationExplorer';
import type { JourneyDefinition } from './JourneyDefinition';
import { JourneyNextActionCard, JourneyStep } from './JourneyStep';

export function JourneyProgress({
  journey,
  onSelect,
  compact = false,
}: {
  journey: JourneyDefinition;
  onSelect: (selection: ExplorerSelection) => void;
  compact?: boolean;
}) {
  return (
    <section className={compact ? 'studio-journey studio-journey-compact' : 'studio-journey'} aria-label="Application lifecycle">
      <div className="studio-section-header">
        <div>
          <span className="studio-kicker">Application Lifecycle</span>
          <h3>{journey.applicationName}</h3>
        </div>
        <strong>{journey.readiness}% ready</strong>
      </div>
      <div className="studio-readiness-bar" aria-label={`${journey.readiness}% ready`}>
        <span style={{ width: `${journey.readiness}%` }} />
      </div>
      <div className="studio-journey-steps">
        {journey.steps.map((step) => (
          <JourneyStep key={step.id} step={step} onSelect={onSelect} />
        ))}
      </div>
      {!compact ? (
        <JourneyNextActionCard
          title={journey.nextAction.title}
          description={journey.nextAction.description}
          buttonLabel={journey.nextAction.buttonLabel}
          tips={journey.nextAction.tips}
          onClick={() => onSelect(journey.nextAction.selection)}
        />
      ) : null}
    </section>
  );
}
