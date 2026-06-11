export function HelpTooltip({ label, children }: { label: string; children: string }) {
  const descriptionId = `studio-help-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  return (
    <span className="studio-help-tooltip">
      <button className="studio-help-trigger" type="button" aria-label={`Help: ${label}`} aria-describedby={descriptionId}>
        ?
      </button>
      <span id={descriptionId} className="studio-help-bubble" role="tooltip">{children}</span>
    </span>
  );
}
