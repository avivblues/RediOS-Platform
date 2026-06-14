import { useState } from 'react';
import { HelpTip } from '../../guide/AdminGuide';
import { loadProcesses, saveProcesses, toMetadataCode, type StudioProcessDraft } from '../metadata-store';
import { MetadataConfirmDeleteModal } from '../shared/MetadataConfirmDeleteModal';

export function ProcessDesigner() {
  const [processes, setProcesses] = useState(() => loadProcesses());
  const [label, setLabel] = useState('Purchase Request');
  const [description, setDescription] = useState('Submit, approve, and complete a business request.');
  const [stepLabel, setStepLabel] = useState('Supervisor Approval');
  const [approver, setApprover] = useState('Supervisor');
  const [condition, setCondition] = useState('amount > 1000');
  const [pendingDelete, setPendingDelete] = useState<{ kind: 'process'; code: string; label: string } | { kind: 'step'; processCode: string; stepId: string; label: string }>();

  function persist(nextProcesses: StudioProcessDraft[]) {
    setProcesses(nextProcesses);
    saveProcesses(nextProcesses);
  }

  function createProcess() {
    const code = toMetadataCode(label);
    const nextProcess: StudioProcessDraft = {
      code,
      label: label.trim() || 'Business Process',
      description,
      steps: [
        { id: 'submit', label: 'Submit', approver: 'Requester' },
        { id: 'done', label: 'Done', approver: 'System' },
      ],
    };

    persist([nextProcess, ...processes.filter((process) => process.code !== code)]);
  }

  function addStep(processCode: string) {
    const cleanLabel = stepLabel.trim();

    if (!cleanLabel) {
      return;
    }

    persist(processes.map((process) => process.code === processCode ? {
      ...process,
      steps: [
        ...process.steps,
        {
          id: toMetadataCode(cleanLabel).toLowerCase(),
          label: cleanLabel,
          approver: approver.trim() || 'Approver',
          condition: condition.trim() || undefined,
        },
      ],
    } : process));
  }

  function removeStep(processCode: string, stepId: string) {
    persist(processes.map((process) => process.code === processCode ? {
      ...process,
      steps: process.steps.filter((step) => step.id !== stepId),
    } : process));
  }

  function removeProcess(processCode: string) {
    persist(processes.filter((process) => process.code !== processCode));
  }

  function confirmDelete() {
    if (!pendingDelete) {
      return;
    }

    if (pendingDelete.kind === 'process') {
      removeProcess(pendingDelete.code);
    } else {
      removeStep(pendingDelete.processCode, pendingDelete.stepId);
    }

    setPendingDelete(undefined);
  }

  return (
    <section className="redos-metadata-card">
      <div className="redos-panel-heading">
        <span className="redos-kicker">Process</span>
        <h3>Process Designer <HelpTip label="Process Designer" text="Business routing dan approval. Ini bukan URL routing." /></h3>
        <p>Definisikan approval, kondisi, hirarki organisasi, dan delegasi sebagai metadata proses.</p>
      </div>

      <div className="redos-designer-form">
        <label>
          Process Name
          <input value={label} onChange={(event) => setLabel(event.target.value)} />
        </label>
        <label>
          Description
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} />
        </label>
        <button className="redos-primary-action" type="button" onClick={createProcess}>Create Process</button>
      </div>

      <div className="redos-inline-form">
        <input value={stepLabel} onChange={(event) => setStepLabel(event.target.value)} placeholder="Approval step" />
        <input value={approver} onChange={(event) => setApprover(event.target.value)} placeholder="Approver / role" />
        <input value={condition} onChange={(event) => setCondition(event.target.value)} placeholder="Condition" />
      </div>

      <div className="redos-metadata-list">
        {processes.map((process) => (
          <section key={process.code} className="redos-tree-object">
            <header>
              <span>
                <strong>{process.label}</strong>
                <small>{process.code} · {process.description}</small>
              </span>
              <button type="button" onClick={() => setPendingDelete({ kind: 'process', code: process.code, label: process.label })}>Delete Process</button>
            </header>
            {process.steps.map((step) => (
              <div key={`${process.code}-${step.id}`} className="redos-list-row">
                <span>
                  <strong>{step.label}</strong>
                  <small>{step.approver}{step.condition ? ` · if ${step.condition}` : ''}</small>
                </span>
                <button type="button" onClick={() => setPendingDelete({ kind: 'step', processCode: process.code, stepId: step.id, label: step.label })}>Delete</button>
              </div>
            ))}
            <button type="button" onClick={() => addStep(process.code)}>Add Step Here</button>
          </section>
        ))}
      </div>
      {pendingDelete ? (
        <MetadataConfirmDeleteModal
          title={pendingDelete.kind === 'process' ? 'Delete Process?' : 'Delete Process Step?'}
          target={pendingDelete.label}
          onCancel={() => setPendingDelete(undefined)}
          onConfirm={confirmDelete}
        />
      ) : null}
    </section>
  );
}
