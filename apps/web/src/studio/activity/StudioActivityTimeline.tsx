import { ActivityTimeline, type ActivityTimelineItem } from './ActivityTimeline';

export type StudioActivityItem = ActivityTimelineItem;

export function StudioActivityTimeline({ items }: { items: StudioActivityItem[] }) {
  return <ActivityTimeline items={items} />;
}
