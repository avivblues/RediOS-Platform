import { Panel } from '../../components/atomic/organisms/Organisms';

export interface StudioActivityItem {
  id: string;
  message: string;
  detail?: string;
}

export function StudioActivityTimeline({ items }: { items: StudioActivityItem[] }) {
  return (
    <Panel title="Recent Changes">
      <div className="studio-timeline">
        {items.length === 0 ? <div className="studio-muted">No recent Studio activity yet.</div> : null}
        {items.map((item) => (
          <div key={item.id} className="studio-timeline-item">
            <strong>{item.message}</strong>
            {item.detail ? <div className="studio-muted">{item.detail}</div> : null}
          </div>
        ))}
      </div>
    </Panel>
  );
}
