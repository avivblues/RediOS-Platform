import { useState } from 'react';
import { HelpTip } from '../../guide/AdminGuide';
import {
  loadActions,
  loadCustomApis,
  loadDataObjects,
  loadStudioApplications,
  resolveActiveApplicationCode,
  saveCustomApis,
  setActiveApplicationCode,
  toMetadataCode,
  type StudioCustomApiDraft,
} from '../metadata-store';
import { MetadataConfirmDeleteModal } from '../shared/MetadataConfirmDeleteModal';
const methods: StudioCustomApiDraft['method'][] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const authModes: StudioCustomApiDraft['auth'][] = ['None', 'API Key', 'Bearer Token'];

export function ApiDesigner() {
  const applications = loadStudioApplications();
  const activeApplicationCode = resolveActiveApplicationCode();
  const initialApplication = applications.find((application) => application.code === activeApplicationCode) ?? applications[0];
  const [selectedApplicationCode, setSelectedApplicationCode] = useState(initialApplication?.code ?? 'INVENTORY');
  const [customApis, setCustomApis] = useState(() => loadCustomApis(initialApplication?.code));
  const [label, setLabel] = useState('Sync Asset to Finance');
  const [method, setMethod] = useState<StudioCustomApiDraft['method']>('POST');
  const [url, setUrl] = useState('https://finance.example.com/assets');
  const [auth, setAuth] = useState<StudioCustomApiDraft['auth']>('Bearer Token');
  const [mappedAction, setMappedAction] = useState('SAVE_PRODUCT');
  const [pendingDelete, setPendingDelete] = useState<StudioCustomApiDraft>();
  const selectedApplication = applications.find((application) => application.code === selectedApplicationCode);
  const actions = loadActions(selectedApplicationCode);
  const generatedApis = loadDataObjects(selectedApplicationCode)
    .flatMap((object) => ['GET', 'POST', 'PUT', 'DELETE'].map((methodName) => `${methodName} ${object.name}`));

  function persist(nextApis: StudioCustomApiDraft[]) {
    setCustomApis(nextApis);
    saveCustomApis(nextApis, selectedApplicationCode);
  }

  function selectApplication(appCode: string) {
    const nextApplication = applications.find((application) => application.code === appCode);
    const nextActions = loadActions(appCode);

    setSelectedApplicationCode(appCode);
    setCustomApis(loadCustomApis(appCode));
    setMappedAction(nextActions[0]?.code ?? '');
    if (nextApplication) {
      setActiveApplicationCode(nextApplication.target, nextApplication.code);
    }
  }

  function saveApi() {
    const nextApi: StudioCustomApiDraft = {
      code: toMetadataCode(label),
      label: label.trim() || 'Connector',
      method,
      url,
      auth,
      mappedAction,
    };
    persist([nextApi, ...customApis.filter((api) => api.code !== nextApi.code)]);
  }

  function removeApi(code: string) {
    persist(customApis.filter((api) => api.code !== code));
  }

  return (
    <section className="redos-metadata-card">
      <div className="redos-panel-heading">
        <span className="redos-kicker">API</span>
        <h3>Connector Designer <HelpTip label="Connector" text="Gunakan hanya untuk integrasi custom. Di builder, user tetap memilih Action." /></h3>
        <p>Generated API tetap runtime-owned. Connector dipanggil melalui Action step.</p>
      </div>

      <section className="redos-data-application-context">
        <label>
          <span>Application</span>
          <select value={selectedApplicationCode} onChange={(event) => selectApplication(event.target.value)}>
            {applications.map((application) => (
              <option key={application.code} value={application.code}>{application.name}</option>
            ))}
          </select>
          <small>Connector yang dibuat akan tersimpan untuk aplikasi ini.</small>
        </label>
        <div>
          <span className="redos-kicker">Active Connector Scope</span>
          <strong>{selectedApplication?.name ?? selectedApplicationCode}</strong>
          <small>{customApis.length} connectors · {actions.length} actions available</small>
        </div>
      </section>

      <section className="redos-tree-object">
        <header><strong>Generated API</strong><span>runtime-owned</span></header>
        {generatedApis.map((api) => (
          <div key={api} className="redos-list-row"><strong>{api}</strong><span>generated</span></div>
        ))}
      </section>

      <div className="redos-designer-form">
        <label>
          Connector Name <HelpTip label="Connector Name" text="Nama integrasi yang mudah dipahami admin, misalnya Sync Asset to Finance." />
          <input value={label} onChange={(event) => setLabel(event.target.value)} />
        </label>
        <label>
          URL <HelpTip label="Connector URL" text="Alamat sistem eksternal. Ini tidak ditampilkan ke business user di Visual Builder." />
          <input value={url} onChange={(event) => setUrl(event.target.value)} />
        </label>
        <div className="redos-inline-form">
          <select data-redos-tooltip="HTTP method untuk connector custom." value={method} onChange={(event) => setMethod(event.target.value as StudioCustomApiDraft['method'])}>
            {methods.map((nextMethod) => <option key={nextMethod}>{nextMethod}</option>)}
          </select>
          <select data-redos-tooltip="Mode auth yang nanti dipakai runtime connector." value={auth} onChange={(event) => setAuth(event.target.value as StudioCustomApiDraft['auth'])}>
            {authModes.map((mode) => <option key={mode}>{mode}</option>)}
          </select>
          <select data-redos-tooltip="Action yang boleh memakai connector ini sebagai step." value={mappedAction} onChange={(event) => setMappedAction(event.target.value)}>
            {actions.map((action) => <option key={action.code} value={action.code}>{action.label}</option>)}
          </select>
        </div>
        <button className="redos-primary-action" data-redos-tooltip="Simpan connector agar bisa dipakai sebagai Action step." type="button" onClick={saveApi}>Save Connector</button>
      </div>

      <div className="redos-metadata-list">
        {customApis.map((api) => (
          <div key={api.code} className="redos-list-row">
            <span>
              <strong>{api.label}</strong>
              <small>{api.method} · {api.url} · Action: {api.mappedAction || 'not mapped'}</small>
            </span>
            <button data-redos-tooltip="Hapus connector custom dari draft metadata lokal." type="button" onClick={() => setPendingDelete(api)}>Delete</button>
          </div>
        ))}
      </div>
      {pendingDelete ? (
        <MetadataConfirmDeleteModal
          title="Delete Connector?"
          target={pendingDelete.label}
          onCancel={() => setPendingDelete(undefined)}
          onConfirm={() => {
            removeApi(pendingDelete.code);
            setPendingDelete(undefined);
          }}
        />
      ) : null}
    </section>
  );
}
