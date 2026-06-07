import { Connector, Node } from '../../../components/atomic/organisms/CanvasPrimitives';
import type { WorkflowCanvasPosition, WorkflowStateDefinition } from '../workflow-types';
import type { DragEvent } from 'react';

export function StateNode({
  state,
  position,
  selected,
  onSelect,
  onDragEnd,
}: {
  state: WorkflowStateDefinition;
  position: WorkflowCanvasPosition;
  selected?: boolean;
  onSelect: () => void;
  onDragEnd: (event: DragEvent<HTMLButtonElement>) => void;
}) {
  const type = state.type ?? (state.initial ? 'INITIAL' : state.final ? 'FINAL' : 'NORMAL');

  return (
    <Node x={position.x} y={position.y} selected={selected} onClick={onSelect} onDragEnd={onDragEnd}>
      <strong>{state.label}</strong>
      <span className="studio-muted">{state.code}</span>
      <Connector>{type}</Connector>
    </Node>
  );
}
