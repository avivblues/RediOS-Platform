import type { DragEvent } from 'react';
import { Button } from '../../../components/atomic/atoms/Atoms';
import { Canvas, MiniMap, Toolbar } from '../../../components/atomic/organisms/CanvasPrimitives';
import { TransitionEdge } from '../edges/TransitionEdge';
import { StateNode } from '../nodes/StateNode';
import type { WorkflowBuilderDraft, WorkflowCanvasPosition, WorkflowSelection } from '../workflow-types';

export function WorkflowCanvas({
  model,
  onSelect,
  onMoveState,
  onAddState,
  onConnectTransition,
}: {
  model: WorkflowBuilderDraft;
  onSelect: (selection: WorkflowSelection) => void;
  onMoveState: (code: string, position: WorkflowCanvasPosition) => void;
  onAddState: () => void;
  onConnectTransition: () => void;
}) {
  const selectedState = model.selected?.kind === 'STATE' ? model.selected.code : undefined;

  return (
    <div>
      <Toolbar>
        <Button variant="secondary" onClick={onAddState} tooltip="Tambah status baru ke alur kerja.">
          Add State
        </Button>
        <Button
          variant="secondary"
          onClick={onConnectTransition}
          disabled={!selectedState || model.workflow.states.length < 2}
          tooltip={selectedState && model.workflow.states.length >= 2 ? 'Hubungkan status ini ke status lain.' : 'Pilih status dan pastikan ada minimal dua status.'}
        >
          Connect Transition
        </Button>
      </Toolbar>
      <Canvas>
        {model.workflow.transitions.map((transition) => {
          const from = model.positions[transition.from];
          const to = model.positions[transition.to];

          if (!from || !to) {
            return null;
          }

          return (
            <TransitionEdge
              key={transition.code}
              transition={transition}
              from={from}
              to={to}
              selected={model.selected?.kind === 'TRANSITION' && model.selected.code === transition.code}
              onSelect={() => onSelect({ kind: 'TRANSITION', code: transition.code })}
            />
          );
        })}
        {model.workflow.states.map((state) => (
          <StateNode
            key={state.code}
            state={state}
            position={model.positions[state.code] ?? { x: 48, y: 48 }}
            selected={model.selected?.kind === 'STATE' && model.selected.code === state.code}
            onSelect={() => onSelect({ kind: 'STATE', code: state.code })}
            onDragEnd={(event) => onMoveState(state.code, dragPosition(event, model.positions[state.code] ?? { x: 48, y: 48 }))}
          />
        ))}
        <MiniMap>
          {model.workflow.states.length} states / {model.workflow.transitions.length} transitions
        </MiniMap>
      </Canvas>
    </div>
  );
}

function dragPosition(event: DragEvent<HTMLButtonElement>, fallback: WorkflowCanvasPosition): WorkflowCanvasPosition {
  const bounds = event.currentTarget.parentElement?.getBoundingClientRect();

  if (!bounds || event.clientX === 0 || event.clientY === 0) {
    return fallback;
  }

  return {
    x: Math.max(16, event.clientX - bounds.left - 88),
    y: Math.max(16, event.clientY - bounds.top - 28),
  };
}
