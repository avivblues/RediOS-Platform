interface AdminGuidePanelProps {
  title: string;
  description: string;
  steps: string[];
}

interface HelpTipProps {
  label: string;
  text: string;
}

export function AdminGuidePanel({ title, description, steps }: AdminGuidePanelProps) {
  return (
    <section className="redos-admin-guide" aria-label={title}>
      <div>
        <span className="redos-kicker">Panduan Admin</span>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <ol>
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </section>
  );
}

export function HelpTip({ label, text }: HelpTipProps) {
  return (
    <span className="redos-help-tip" tabIndex={0} aria-label={`${label}: ${text}`} data-redos-tooltip={text}>
      ?
    </span>
  );
}
