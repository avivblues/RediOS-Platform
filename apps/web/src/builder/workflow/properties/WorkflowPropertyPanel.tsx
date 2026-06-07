import { Button, Input, Select } from '../../../components/atomic/atoms/Atoms';
import { Panel } from '../../../components/atomic/organisms/Organisms';
import type { WorkflowDefinition, WorkflowSelection, WorkflowStateDefinition, WorkflowTransitionDefinition } from '../workflow-types';

export function WorkflowPropertyPanel({
  workflow,
  selection,
  onUpdateState,
  onRemoveState,
  onUpdateTransition,
  onRemoveTransition,
}: {
  workflow: WorkflowDefinition;
  selection?: WorkflowSelection;
  onUpdateState: (state: WorkflowStateDefinition) => void;
  onRemoveState: (code: string) => void;
  onUpdateTransition: (transition: WorkflowTransitionDefinition) => void;
  onRemoveTransition: (code: string) => void;
}) {
  const state = selection?.kind === 'STATE' ? workflow.states.find((candidate) => candidate.code === selection.code) : undefined;
  const transition =
    selection?.kind === 'TRANSITION' ? workflow.transitions.find((candidate) => candidate.code === selection.code) : undefined;

  return (
    <Panel title="Workflow Properties">
      {!state && !transition ? <div className="studio-empty">Select a state or transition.</div> : null}
      {state ? (
        <div className="studio-form-field">
          <Input value={state.code} onChange={(value) => onUpdateState({ ...state, code: value })} />
          <Input value={state.label} onChange={(value) => onUpdateState({ ...state, label: value })} />
          <Select value={state.type ?? (state.initial ? 'INITIAL' : state.final ? 'FINAL' : 'NORMAL')} options={['INITIAL', 'NORMAL', 'FINAL']} onChange={(value) => onUpdateState({ ...state, type: value as WorkflowStateDefinition['type'] })} />
          <Input value={state.colorToken ?? ''} placeholder="color token" onChange={(value) => onUpdateState({ ...state, colorToken: value })} />
          <Button variant="danger" onClick={() => onRemoveState(state.code)}>
            Remove State
          </Button>
        </div>
      ) : null}
      {transition ? (
        <div className="studio-form-field">
          <Input value={transition.code} onChange={(value) => onUpdateTransition({ ...transition, code: value })} />
          <Select value={transition.from} options={workflow.states.map((candidate) => candidate.code)} onChange={(value) => onUpdateTransition({ ...transition, from: value })} />
          <Select value={transition.to} options={workflow.states.map((candidate) => candidate.code)} onChange={(value) => onUpdateTransition({ ...transition, to: value })} />
          <Input value={transition.actionCode} placeholder="actionCode" onChange={(value) => onUpdateTransition({ ...transition, actionCode: value })} />
          <Input value={String(transition.condition ?? '')} placeholder="condition" onChange={(value) => onUpdateTransition({ ...transition, condition: value })} />
          <Input value={transition.securityPolicy ?? ''} placeholder="security policy" onChange={(value) => onUpdateTransition({ ...transition, securityPolicy: value })} />
          <Input value={transition.processBinding ?? ''} placeholder="process binding" onChange={(value) => onUpdateTransition({ ...transition, processBinding: value })} />
          <Button variant="danger" onClick={() => onRemoveTransition(transition.code)}>
            Remove Transition
          </Button>
        </div>
      ) : null}
    </Panel>
  );
}
