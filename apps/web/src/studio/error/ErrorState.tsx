import { useState } from 'react';
import { Button } from '../../components/atomic/atoms/Atoms';

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="studio-error-state">
      <h3>Unable to load Studio data</h3>
      <p>Possible reasons:</p>
      <ul>
        <li>API offline</li>
        <li>Permission denied</li>
        <li>Missing metadata</li>
      </ul>
      <div className="studio-action-row">
        <Button onClick={onRetry}>Retry</Button>
        <Button variant="secondary" onClick={() => setShowDetails((current) => !current)}>
          View technical details
        </Button>
      </div>
      {showDetails ? <pre>{message}</pre> : null}
    </div>
  );
}
