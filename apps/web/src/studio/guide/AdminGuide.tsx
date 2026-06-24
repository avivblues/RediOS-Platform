interface HelpTipProps {
  label: string;
  text: string;
}

/** Contextual hint only — max ~120 chars. Long guides live in docs/handbook + docs/design/UI_UX_STANDARDS.md */
export function HelpTip({ label, text }: HelpTipProps) {
  return (
    <span className="redos-help-tip" tabIndex={0} aria-label={`${label}: ${text}`} data-redos-tooltip={text}>
      ?
    </span>
  );
}
