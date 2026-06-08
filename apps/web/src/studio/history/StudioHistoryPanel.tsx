import { useEffect, useState } from 'react';
import type { DesignerClient, StudioHistoryEntry } from '../../core/api/designer-client';
import { Button } from '../../components/atomic/atoms/Atoms';
import { Panel } from '../../components/atomic/organisms/Organisms';
import { humanizeCode } from '../humanizer/HumanizerEngine';

export function StudioHistoryPanel({
  designer,
  draftId,
  onRestored,
}: {
  designer: DesignerClient;
  draftId?: string;
  onRestored?: () => void;
}) {
  const [history, setHistory] = useState<StudioHistoryEntry[]>([]);
  const [selected, setSelected] = useState<StudioHistoryEntry | undefined>();
  const [status, setStatus] = useState<string | undefined>();

  useEffect(() => {
    let mounted = true;

    designer.history().then((entries) => {
      if (mounted) {
        setHistory(entries);
      }
    }).catch(() => {
      if (mounted) {
        setHistory([]);
      }
    });

    return () => {
      mounted = false;
    };
  }, [designer]);

  async function restore(entry: StudioHistoryEntry) {
    if (!draftId) {
      return;
    }

    setStatus('Restoring selected version...');
    await designer.rollback(draftId, entry.version);
    setStatus('Version restored.');
    onRestored?.();
  }

  return (
    <Panel title="History">
      <div className="studio-history-panel">
        {status ? <div className="studio-impact studio-impact-info">{status}</div> : null}
        {history.length === 0 ? <div className="studio-muted">No saved versions yet.</div> : null}
        {history.map((entry) => (
          <article key={entry.id} className="studio-history-item">
            <div>
              <strong>Version {entry.version}</strong>
              <p>{entry.summary}</p>
              <span className="studio-muted">{humanizeCode(entry.targetType)} {humanizeCode(entry.targetCode)}</span>
            </div>
            <div className="studio-action-row">
              <Button variant="secondary" onClick={() => setSelected(entry)} tooltip={`Lihat ringkasan versi ${entry.version} sebelum dipulihkan.`}>Preview</Button>
              <Button
                onClick={draftId ? () => void restore(entry) : undefined}
                disabled={!draftId}
                tooltip={draftId ? `Pulihkan rancangan ke versi ${entry.version}.` : 'Pemulihan membutuhkan rancangan aktif terlebih dahulu.'}
              >
                Restore
              </Button>
            </div>
          </article>
        ))}
        {selected ? (
          <section className="studio-card" aria-label="Selected version preview">
            <h4>Version {selected.version}</h4>
            <p>{selected.summary}</p>
            <div className="studio-muted">Created by {selected.createdBy}</div>
            <div className="studio-muted">{selected.createdAt ? new Date(selected.createdAt).toLocaleString() : 'Time not recorded'}</div>
          </section>
        ) : null}
      </div>
    </Panel>
  );
}
