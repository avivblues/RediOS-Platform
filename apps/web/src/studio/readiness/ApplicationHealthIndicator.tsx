import { StudioBadge } from '../design-system/StudioDesignSystem';

export interface ApplicationHealthCheck {
  label: string;
  ready: boolean;
  optional?: boolean;
}

export function ApplicationHealthIndicator({ checks }: { checks: ApplicationHealthCheck[] }) {
  const requiredChecks = checks.filter((check) => !check.optional);
  const readyCount = requiredChecks.filter((check) => check.ready).length;
  const percentage = requiredChecks.length === 0 ? 100 : Math.round((readyCount / requiredChecks.length) * 100);

  return (
    <div className="studio-health-indicator" aria-label={`Application Health ${percentage}% Ready`}>
      <div className="studio-list-row">
        <strong>Application Health</strong>
        <span>{percentage}% Ready</span>
      </div>
      <div className="studio-readiness-bar" aria-hidden="true">
        <span style={{ width: `${percentage}%` }} />
      </div>
      <div className="studio-chip-list">
        {checks.map((check) => (
          <StudioBadge key={check.label} tone={check.ready ? 'success' : check.optional ? 'info' : 'warning'}>
            {check.ready ? '✔' : check.optional ? 'Optional' : 'Missing'} {check.label}
          </StudioBadge>
        ))}
      </div>
    </div>
  );
}

export function applicationHealthChecks({
  dataCount,
  screenCount,
  securityReady = true,
  processCount,
}: {
  dataCount: number;
  screenCount: number;
  securityReady?: boolean;
  processCount: number;
}): ApplicationHealthCheck[] {
  return [
    { label: 'Data', ready: dataCount > 0 },
    { label: 'Screens', ready: screenCount > 0 },
    { label: 'Security', ready: securityReady },
    { label: 'Process', ready: processCount > 0, optional: true },
  ];
}
