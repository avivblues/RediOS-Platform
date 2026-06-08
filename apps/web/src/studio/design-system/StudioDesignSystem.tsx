import type { PropsWithChildren, ReactNode } from 'react';

export function StudioCard({
  children,
  interactive = false,
  onClick,
}: PropsWithChildren<{
  interactive?: boolean;
  onClick?: () => void;
}>) {
  if (interactive) {
    return (
      <button className="studio-ds-card studio-ds-card-interactive" onClick={onClick ?? comingSoon}>
        {children}
      </button>
    );
  }

  return <div className="studio-ds-card">{children}</div>;
}

export function StudioPanel({ title, children, action }: PropsWithChildren<{ title: string; action?: ReactNode }>) {
  return (
    <section className="studio-ds-panel">
      <div className="studio-section-header">
        <h3>{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

export function StudioButton({
  children,
  variant = 'primary',
  disabled,
  onClick,
}: PropsWithChildren<{
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  onClick?: () => void;
}>) {
  return (
    <button className={`studio-button studio-button-${variant}`} disabled={disabled} onClick={onClick ?? comingSoon}>
      {children}
    </button>
  );
}

export function StudioStepper({
  steps,
  activeIndex,
  isStepEnabled,
  onStepClick,
}: {
  steps: string[];
  activeIndex: number;
  isStepEnabled: (index: number) => boolean;
  onStepClick: (index: number) => void;
}) {
  return (
    <div className="studio-stepper">
      {steps.map((step, index) => {
        const enabled = isStepEnabled(index);
        return (
          <button
            key={step}
            className={index === activeIndex ? 'studio-stepper-item studio-stepper-item-active' : 'studio-stepper-item'}
            onClick={() => (enabled ? onStepClick(index) : window.alert('Complete previous step first'))}
          >
            <span>{index + 1}</span>
            <strong>{step}</strong>
            {!enabled ? <small>Locked</small> : null}
          </button>
        );
      })}
    </div>
  );
}

export function StudioEmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="studio-empty-state">
      <strong>{title}</strong>
      <p>{description}</p>
      <div className="studio-action-row">{action ?? <StudioButton variant="secondary">Learn More</StudioButton>}</div>
    </div>
  );
}

export function StudioBadge({ children, tone = 'info' }: PropsWithChildren<{ tone?: 'info' | 'warning' | 'danger' | 'success' }>) {
  return <span className={`studio-badge studio-badge-${tone}`}>{children}</span>;
}

export function comingSoon() {
  window.alert('Coming soon');
}
