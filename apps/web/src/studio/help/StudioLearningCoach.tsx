export interface LearningStep {
  title: string;
  body: string;
}

export function StudioLearningCoach({
  title,
  purpose,
  steps,
  currentTip,
}: {
  title: string;
  purpose: string;
  steps: LearningStep[];
  currentTip: string;
}) {
  return (
    <aside className="studio-learning-coach" aria-label={title}>
      <div>
        <span className="studio-kicker">Learning Coach</span>
        <h3>{title}</h3>
        <p>{purpose}</p>
      </div>
      <ol>
        {steps.map((step) => (
          <li key={step.title}>
            <strong>{step.title}</strong>
            <span>{step.body}</span>
          </li>
        ))}
      </ol>
      <div className="studio-guided-hint">
        <strong>What should I do now?</strong>
        <p>{currentTip}</p>
      </div>
    </aside>
  );
}
