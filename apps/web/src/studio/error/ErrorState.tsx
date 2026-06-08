import { useState } from 'react';
import { Button } from '../../components/atomic/atoms/Atoms';
import { humanizeStudioError } from './error-humanizer';

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const friendlyMessage = humanizeStudioError(message);

  return (
    <div className="studio-error-state">
      <h3>Unable to load Studio data</h3>
      <p>{friendlyMessage}</p>
      <p>Possible reasons:</p>
      <ul>
        <li>API offline</li>
        <li>Permission denied</li>
        <li>Application setup is incomplete</li>
      </ul>
      <div className="studio-action-row">
        <Button onClick={onRetry} tooltip="Coba ambil data Studio lagi dari API.">Retry</Button>
        <Button variant="secondary" onClick={() => setShowDetails((current) => !current)} tooltip="Tampilkan pesan teknis untuk pengembang atau admin.">
          View technical details
        </Button>
        <Button variant="secondary" onClick={onRetry} tooltip="Muat ulang setelah koneksi atau data diperbaiki.">Fix Connection</Button>
        <Button variant="secondary" disabled tooltip="Fitur ini akan tersedia ketika ada rancangan aktif yang bisa diedit.">Remove Connection</Button>
      </div>
      {showDetails ? <pre>{message}</pre> : null}
    </div>
  );
}
