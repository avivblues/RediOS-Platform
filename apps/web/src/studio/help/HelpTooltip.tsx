export function HelpTooltip({ label, children }: { label: string; children: string }) {
  return (
    <span className="studio-help-tooltip">
      <button className="studio-help-trigger" type="button" aria-label={`Help: ${label}`}>
        ?
      </button>
      <span className="studio-help-bubble">{children}</span>
    </span>
  );
}
