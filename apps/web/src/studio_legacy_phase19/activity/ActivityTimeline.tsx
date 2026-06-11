import { Panel } from '../../components/atomic/organisms/Organisms';

export interface ActivityTimelineItem {
  id: string;
  message: string;
  detail?: string;
  actor?: string;
  timestamp?: Date;
}

export function ActivityTimeline({ items }: { items: ActivityTimelineItem[] }) {
  return (
    <Panel title="Activity Timeline">
      <div className="studio-timeline" aria-label="Studio activity timeline">
        <strong>Today</strong>
        {items.length === 0 ? <div className="studio-muted">No activity recorded today.</div> : null}
        {items.map((item) => (
          <div key={item.id} className="studio-timeline-item">
            <strong>{item.actor ? `${item.actor} ` : ''}{item.message}</strong>
            {item.detail ? <div className="studio-muted">{item.detail}</div> : null}
            {item.timestamp ? <div className="studio-muted">{item.timestamp.toLocaleTimeString()}</div> : null}
          </div>
        ))}
      </div>
    </Panel>
  );
}
