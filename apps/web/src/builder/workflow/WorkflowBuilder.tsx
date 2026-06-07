import { useEffect, useMemo, useState } from 'react';
import type { MetadataDraft, MetadataDefinition } from '@redios/shared';
import { Badge, Button } from '../../components/atomic/atoms/Atoms';
import { Panel } from '../../components/atomic/organisms/Organisms';
import type { DesignerClient, DesignerPreviewResult } from '../../core/api/designer-client';
import type { RuntimeClient } from '../../core/api/runtime-client';
import type { RuntimeContext } from '../../core/renderer/runtime-types';
import { WorkflowCanvas } from './canvas/WorkflowCanvas';
import { WorkflowPropertyPanel } from './properties/WorkflowPropertyPanel';
import { WorkflowSimulator } from './simulator/WorkflowSimulator';
import type {
  WorkflowBuilderDraft,
  WorkflowCanvasPosition,
  WorkflowDefinition,
  WorkflowSelection,
  WorkflowStateDefinition,
  WorkflowTransitionDefinition,
} from './workflow-types';

export function WorkflowBuilder({
  metadata,
  designer,
  runtime,
  context,
  onPreview,
}: {
  metadata?: MetadataDefinition<WorkflowDefinition>;
  designer: DesignerClient;
  runtime: RuntimeClient;
  context: RuntimeContext;
  onPreview: (preview: DesignerPreviewResult) => void;
}) {
  const [draft, setDraft] = useState<MetadataDraft | undefined>();
  const [workflow, setWorkflow] = useState<WorkflowDefinition | undefined>(metadata?.definition);
  const [selection, setSelection] = useState<WorkflowSelection | undefined>();
  const [positions, setPositions] = useState<Record<string, WorkflowCanvasPosition>>({});
  const [dependency, setDependency] = useState<unknown>();

  useEffect(() => {
    setWorkflow(metadata?.definition);
    setDraft(undefined);
    setSelection(undefined);
    setDependency(undefined);
    setPositions({});
  }, [metadata]);

  const model = useMemo<WorkflowBuilderDraft | undefined>(() => {
    if (!workflow) {
      return undefined;
    }

    return {
      workflow,
      selected: selection,
      positions: {
        ...defaultPositions(workflow),
        ...positions,
      },
    };
  }, [positions, selection, workflow]);

  async function ensureDraft(): Promise<MetadataDraft | undefined> {
    if (draft || !workflow) {
      return draft;
    }

    const nextDraft = await designer.createDraft({
      targetType: 'WORKFLOW',
      targetCode: workflow.code,
      entityCode: workflow.entityCode,
    });
    setDraft(nextDraft);
    return nextDraft;
  }

  async function apply(operation: Parameters<DesignerClient['applyOperation']>[1]) {
    const targetDraft = await ensureDraft();

    if (!targetDraft?.id) {
      return;
    }

    const nextDraft = await designer.applyOperation(targetDraft.id, operation);
    setDraft(nextDraft);
    setWorkflow(nextDraft.draft.definition as WorkflowDefinition);
  }

  async function addState() {
    const nextIndex = (workflow?.states.length ?? 0) + 1;
    const code = `STATE_${nextIndex}`;
    await apply({
      type: 'ADD_STATE',
      payload: {
        code,
        label: code,
        type: workflow?.states.length ? 'NORMAL' : 'INITIAL',
      },
    });
    setSelection({ kind: 'STATE', code });
  }

  async function connectTransition() {
    if (!workflow || selection?.kind !== 'STATE') {
      return;
    }

    const target = workflow.states.find((state) => state.code !== selection.code);

    if (!target) {
      return;
    }

    const code = `${selection.code}_TRANSITION_${target.code}`;
    await apply({
      type: 'ADD_TRANSITION',
      payload: {
        code,
        from: selection.code,
        to: target.code,
        actionCode: '',
      },
    });
    setSelection({ kind: 'TRANSITION', code });
  }

  async function updateState(nextState: WorkflowStateDefinition) {
    if (selection?.kind !== 'STATE') {
      return;
    }

    await apply({
      type: 'UPDATE_STATE',
      payload: {
        code: selection.code,
        nextCode: nextState.code,
        label: nextState.label,
        type: nextState.type,
        colorToken: nextState.colorToken,
      },
    });
    setSelection({ kind: 'STATE', code: nextState.code });
  }

  async function removeState(code: string) {
    setDependency(await runtime.analyzeDependency('WORKFLOW', workflow?.code ?? code));
    await apply({
      type: 'REMOVE_STATE',
      payload: {
        code,
      },
    });
    setSelection(undefined);
  }

  async function updateTransition(nextTransition: WorkflowTransitionDefinition) {
    if (selection?.kind !== 'TRANSITION') {
      return;
    }

    await apply({
      type: 'UPDATE_TRANSITION',
      payload: {
        code: selection.code,
        nextCode: nextTransition.code,
        from: nextTransition.from,
        to: nextTransition.to,
        actionCode: nextTransition.actionCode,
        condition: nextTransition.condition,
        securityPolicy: nextTransition.securityPolicy,
        processBinding: nextTransition.processBinding,
      },
    });
    setSelection({ kind: 'TRANSITION', code: nextTransition.code });
  }

  async function removeTransition(code: string) {
    await apply({
      type: 'REMOVE_TRANSITION',
      payload: {
        code,
      },
    });
    setSelection(undefined);
  }

  async function preview() {
    if (draft?.id) {
      onPreview(await designer.preview(draft.id));
    }
  }

  async function publish() {
    if (draft?.id) {
      await designer.publish(draft.id);
    }
  }

  if (!workflow || !model) {
    return <Panel title="Workflow Builder">Select workflow metadata to open the visual builder.</Panel>;
  }

  return (
    <Panel title="Workflow Builder">
      <div className="studio-section-header">
        <div>
          <strong>{workflow.code}</strong>
          <div className="studio-muted">Entity binding comes from workflow metadata: {workflow.entityCode}</div>
        </div>
        <div className="studio-action-row">
          <Button variant="secondary" onClick={() => void ensureDraft()}>
            Create Draft
          </Button>
          <Button variant="secondary" onClick={() => void preview()} disabled={!draft}>
            Preview
          </Button>
          <Button onClick={() => void publish()} disabled={!draft}>
            Publish
          </Button>
        </div>
      </div>
      <div className="studio-workflow-grid">
        <WorkflowCanvas
          model={model}
          onSelect={setSelection}
          onMoveState={(code, position) => setPositions((current) => ({ ...current, [code]: position }))}
          onAddState={() => void addState()}
          onConnectTransition={() => void connectTransition()}
        />
        <WorkflowPropertyPanel
          workflow={workflow}
          selection={selection}
          onUpdateState={(state) => void updateState(state)}
          onRemoveState={(code) => void removeState(code)}
          onUpdateTransition={(transition) => void updateTransition(transition)}
          onRemoveTransition={(code) => void removeTransition(code)}
        />
      </div>
      {dependency ? (
        <section className="studio-card">
          <h4>Dependency Impact Before Removal</h4>
          <div className="studio-action-row">
            {['Process', 'Event', 'Security', 'UI', 'Forms'].map((area) => (
              <Badge key={area} tone="warning">
                {area}
              </Badge>
            ))}
          </div>
          <pre>{JSON.stringify(dependency, null, 2)}</pre>
        </section>
      ) : null}
      <WorkflowSimulator workflow={workflow} runtime={runtime} context={context} />
    </Panel>
  );
}

function defaultPositions(workflow: WorkflowDefinition): Record<string, WorkflowCanvasPosition> {
  return workflow.states.reduce<Record<string, WorkflowCanvasPosition>>((positions, state, index) => {
    positions[state.code] = {
      x: 80 + (index % 3) * 240,
      y: 64 + Math.floor(index / 3) * 180,
    };
    return positions;
  }, {});
}
