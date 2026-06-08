import { useState } from 'react';
import { Badge, Button, Select } from '../../../components/atomic/atoms/Atoms';
import { Panel } from '../../../components/atomic/organisms/Organisms';
import type { RuntimeClient } from '../../../core/api/runtime-client';
import type { RuntimeContext } from '../../../core/renderer/runtime-types';
import type { WorkflowDefinition } from '../workflow-types';

interface WorkflowSimulationResult {
  success?: boolean;
  steps?: Array<{
    stage: string;
    status: string;
    message: string;
  }>;
  predicted?: {
    workflow?: {
      from: string;
      to: string;
    };
    process?: {
      executed: boolean;
      processCode?: string;
    };
    events?: {
      events: string[];
    };
    ledger?: {
      impacts: string[];
    };
  };
}

export function WorkflowSimulator({
  workflow,
  runtime,
  context,
}: {
  workflow: WorkflowDefinition;
  runtime: RuntimeClient;
  context: RuntimeContext;
}) {
  const [currentState, setCurrentState] = useState(workflow.states.find((state) => state.initial || state.type === 'INITIAL')?.code ?? workflow.states[0]?.code ?? '');
  const [actionCode, setActionCode] = useState(workflow.transitions[0]?.actionCode ?? '');
  const [result, setResult] = useState<WorkflowSimulationResult | undefined>();

  async function simulate() {
    setResult(
      (await runtime.simulate({
        tenantId: context.tenantId,
        domainCode: context.domainCode,
        applicationCode: context.applicationCode,
        entityCode: workflow.entityCode,
        actionCode,
        currentState,
        permissions: context.permissions,
        roles: context.roles,
        platform: 'WEB',
      })) as WorkflowSimulationResult,
    );
  }

  return (
    <Panel title="Workflow Simulator">
      <div className="studio-action-row">
        <Select value={currentState} options={workflow.states.map((state) => state.code)} onChange={setCurrentState} />
        <Select value={actionCode} options={[...new Set(workflow.transitions.map((transition) => transition.actionCode))]} onChange={setActionCode} />
        <Button onClick={() => void simulate()} disabled={!currentState || !actionCode} tooltip={currentState && actionCode ? 'Jalankan simulasi alur kerja untuk status dan aksi ini.' : 'Pilih status dan aksi dulu.'}>
          Simulate
        </Button>
      </div>
      {result ? (
        <div className="studio-preview-grid">
          <section className="studio-card">
            <h4>Outcome</h4>
            <Badge tone={result.success ? 'success' : 'danger'}>{result.success ? 'SUCCESS' : 'FAILED'}</Badge>
            <div className="studio-muted">Next state: {result.predicted?.workflow?.to ?? 'unchanged'}</div>
            <div className="studio-muted">Process executed: {String(result.predicted?.process?.executed ?? false)}</div>
            <div className="studio-muted">Events: {result.predicted?.events?.events.join(', ') || 'none'}</div>
            <div className="studio-muted">Ledger impact: {result.predicted?.ledger?.impacts.join(', ') || 'none'}</div>
          </section>
          <section className="studio-card">
            <h4>Runtime Trace</h4>
            {result.steps
              ?.filter((step) => ['SECURITY', 'WORKFLOW', 'PROCESS', 'EVENT'].includes(step.stage))
              .map((step) => (
                <div key={`${step.stage}:${step.message}`} className="studio-list-row">
                  <strong>{step.stage}</strong>
                  <span>{step.status}</span>
                </div>
              ))}
          </section>
        </div>
      ) : null}
    </Panel>
  );
}
