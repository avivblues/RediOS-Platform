import { Edge } from '../../../components/atomic/organisms/CanvasPrimitives';
import type { WorkflowCanvasPosition, WorkflowTransitionDefinition } from '../workflow-types';

export function TransitionEdge({
  transition,
  from,
  to,
  selected,
  onSelect,
}: {
  transition: WorkflowTransitionDefinition;
  from: WorkflowCanvasPosition;
  to: WorkflowCanvasPosition;
  selected?: boolean;
  onSelect: () => void;
}) {
  return (
    <Edge
      x1={from.x + 88}
      y1={from.y + 56}
      x2={to.x + 88}
      y2={to.y + 20}
      label={transition.actionCode}
      selected={selected}
      onClick={onSelect}
    />
  );
}
