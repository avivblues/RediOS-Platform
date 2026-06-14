import { useState } from 'react';
import { HelpTip } from '../../guide/AdminGuide';
import {
  loadActions,
  loadCustomApis,
  loadStudioApplications,
  resolveActiveApplicationCode,
  saveActions,
  setActiveApplicationCode,
  toMetadataCode,
  type StudioActionDraft,
  type StudioActionTrigger,
} from '../metadata-store';
import { MetadataConfirmDeleteModal } from '../shared/MetadataConfirmDeleteModal';

const triggers: Array<{ label: string; value: StudioActionTrigger }> = [
  { label: 'Button clicked', value: 'onClick' },
  { label: 'Value changed', value: 'onChange' },
  { label: 'Form submitted', value: 'onSubmit' },
  { label: 'Component focused', value: 'onFocus' },
  { label: 'Component blurred', value: 'onBlur' },
  { label: 'Screen loaded', value: 'onLoad' },
  { label: 'Process step reached', value: 'process' },
];

export function ActionDesigner() {
  const applications = loadStudioApplications();
  const activeApplicationCode = resolveActiveApplicationCode();
  const initialApplication = applications.find((application) => application.code === activeApplicationCode) ?? applications[0];
  const [selectedApplicationCode, setSelectedApplicationCode] = useState(initialApplication?.code ?? 'INVENTORY');
  const [actions, setActions] = useState(() => loadActions(initialApplication?.code));
  const [label, setLabel] = useState('Save Product');
  const [trigger, setTrigger] = useState<StudioActionTrigger>('onClick');
  const [step, setStep] = useState('save');
  const [pendingDelete, setPendingDelete] = useState<{ kind: 'action'; code: string; label: string } | { kind: 'step'; code: string; step: string; index: number }>();
  const selectedApplication = applications.find((application) => application.code === selectedApplicationCode);
  const customApis = loadCustomApis(selectedApplicationCode);

  function persist(nextActions: StudioActionDraft[]) {
    setActions(nextActions);
    saveActions(nextActions, selectedApplicationCode);
  }

  function selectApplication(appCode: string) {
    const nextApplication = applications.find((application) => application.code === appCode);

    setSelectedApplicationCode(appCode);
    setActions(loadActions(appCode));
    if (nextApplication) {
      setActiveApplicationCode(nextApplication.target, nextApplication.code);
    }
  }

  function addAction() {
    const nextAction: StudioActionDraft = {
      code: toMetadataCode(label),
      label: label.trim() || 'New Action',
      trigger,
      steps: ['validate', 'save'],
    };
    persist([nextAction, ...actions.filter((action) => action.code !== nextAction.code)]);
  }

  function addStep(code: string, nextStep = step) {
    const cleanStep = nextStep.trim();

    if (!cleanStep) {
      return;
    }

    persist(actions.map((action) => action.code === code ? {
      ...action,
      steps: [...action.steps, cleanStep],
    } : action));
  }

  function removeAction(code: string) {
    persist(actions.filter((action) => action.code !== code));
  }

  function removeStep(code: string, index: number) {
    persist(actions.map((action) => action.code === code ? {
      ...action,
      steps: action.steps.filter((_, stepIndex) => stepIndex !== index),
    } : action));
  }

  function confirmDelete() {
    if (!pendingDelete) {
      return;
    }

    if (pendingDelete.kind === 'action') {
      removeAction(pendingDelete.code);
    } else {
      removeStep(pendingDelete.code, pendingDelete.index);
    }

    setPendingDelete(undefined);
  }

  return (
    <section className="redos-metadata-card">
      <div className="redos-panel-heading">
        <span className="redos-kicker">ACTION</span>
        <h3>Action Designer <HelpTip label="Action Designer" text="Buat alur bisnis untuk tombol dan event. Button memilih Action, bukan endpoint." /></h3>
        <p>Action adalah langkah kerja bisnis yang dapat berisi validasi, simpan data, notifikasi, atau connector.</p>
      </div>

      <section className="redos-data-application-context">
        <label>
          <span>Application</span>
          <select value={selectedApplicationCode} onChange={(event) => selectApplication(event.target.value)}>
            {applications.map((application) => (
              <option key={application.code} value={application.code}>{application.name}</option>
            ))}
          </select>
          <small>Action yang dibuat akan tersedia untuk button/event aplikasi ini.</small>
        </label>
        <div>
          <span className="redos-kicker">Active Action Scope</span>
          <strong>{selectedApplication?.name ?? selectedApplicationCode}</strong>
          <small>{actions.length} actions · {customApis.length} connectors available</small>
        </div>
      </section>

      <div className="redos-inline-form">
        <input data-redos-tooltip="Contoh Action: Save Product, Approve Asset, Submit Ticket." value={label} onChange={(event) => setLabel(event.target.value)} placeholder="Action label" />
        <select data-redos-tooltip="Trigger menentukan kapan Action dijalankan oleh runtime." value={trigger} onChange={(event) => setTrigger(event.target.value as StudioActionTrigger)}>
          {triggers.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
        <button data-redos-tooltip="Buat Action baru agar bisa dipilih di property inspector builder." type="button" onClick={addAction}>Create Action</button>
      </div>

      <div className="redos-inline-form">
        <input data-redos-tooltip="Step adalah urutan kerja Action, misalnya validate, save, notify, atau call connector." value={step} onChange={(event) => setStep(event.target.value)} placeholder="Step name" />
      </div>

      <div className="redos-metadata-list">
        {actions.map((action) => (
          <section key={action.code} className="redos-tree-object">
            <header>
              <span>
                <strong>{action.label}</strong>
                <small>{action.code} · {action.trigger}</small>
              </span>
              <button data-redos-tooltip="Hapus Action dari draft metadata lokal." type="button" onClick={() => setPendingDelete({ kind: 'action', code: action.code, label: action.label })}>Delete Action</button>
            </header>
            {action.steps.map((actionStep, index) => (
              <div key={`${action.code}-${actionStep}-${index}`} className="redos-list-row">
                <strong>{actionStep}</strong>
                <button data-redos-tooltip="Hapus step ini dari Action." type="button" onClick={() => setPendingDelete({ kind: 'step', code: action.code, step: actionStep, index })}>Delete</button>
              </div>
            ))}
            <div className="redos-inline-form">
              <button data-redos-tooltip="Tambahkan step manual ke Action ini." type="button" onClick={() => addStep(action.code)}>Add Step</button>
              {customApis.map((api) => (
                <button key={api.code} data-redos-tooltip="Tambahkan connector ini sebagai step Action, tetap event-first." type="button" onClick={() => addStep(action.code, `call ${api.code}`)}>
                  Use {api.label}
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
      {pendingDelete ? (
        <MetadataConfirmDeleteModal
          title={pendingDelete.kind === 'action' ? 'Delete Action?' : 'Delete Action Step?'}
          target={pendingDelete.kind === 'action' ? pendingDelete.label : pendingDelete.step}
          onCancel={() => setPendingDelete(undefined)}
          onConfirm={confirmDelete}
        />
      ) : null}
    </section>
  );
}
