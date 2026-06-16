import { useState } from 'react';
import { HelpTip } from '../../guide/AdminGuide';
import {
  loadActions,
  loadCustomApis,
  loadDataObjects,
  loadQueries,
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
  const [label, setLabel] = useState('Sync Asset to Finance API');
  const [method, setMethod] = useState<StudioCustomApiDraft['method']>('POST');
  const [url, setUrl] = useState('https://finance.example.com/assets');
  const [auth, setAuth] = useState<StudioCustomApiDraft['auth']>('Bearer Token');
  const [mappedAction, setMappedAction] = useState('SAVE_PRODUCT');
  const [source, setSource] = useState<NonNullable<StudioCustomApiDraft['source']>>('QUERY');
  const [queryCode, setQueryCode] = useState('');
  const [objectName, setObjectName] = useState('');
  const [pendingDelete, setPendingDelete] = useState<StudioCustomApiDraft>();
  const selectedApplication = applications.find((application) => application.code === selectedApplicationCode);
  const actions = loadActions(selectedApplicationCode);
  const dataObjects = loadDataObjects(selectedApplicationCode);
  const queries = loadQueries(selectedApplicationCode);
  const selectedQuery = queries.find((query) => query.code === queryCode) ?? queries[0];
  const selectedObject = dataObjects.find((object) => object.name === objectName) ?? dataObjects[0];
  const generatedObjectApis = dataObjects
    .flatMap((object) => ['GET', 'POST', 'PUT', 'DELETE'].map((methodName) => `${methodName} /runtime/object/${object.name}`));
  const generatedQueryApis = queries.map((query) => `GET /runtime/query/${query.code}`);
  const generatedApis = [...generatedQueryApis, ...generatedObjectApis];

  function persist(nextApis: StudioCustomApiDraft[]) {
    setCustomApis(nextApis);
    saveCustomApis(nextApis, selectedApplicationCode);
  }

  function selectApplication(appCode: string) {
    const nextApplication = applications.find((application) => application.code === appCode);
    const nextActions = loadActions(appCode);
    const nextQueries = loadQueries(appCode);
    const nextObjects = loadDataObjects(appCode);

    setSelectedApplicationCode(appCode);
    setCustomApis(loadCustomApis(appCode));
    setMappedAction(nextActions[0]?.code ?? '');
    setQueryCode(nextQueries[0]?.code ?? '');
    setObjectName(nextObjects[0]?.name ?? '');
    if (nextApplication) {
      setActiveApplicationCode(nextApplication.target, nextApplication.code);
    }
  }

  function saveApi() {
    const generatedUrl = source === 'QUERY'
      ? `/runtime/query/${selectedQuery?.code ?? queryCode}`
      : source === 'OBJECT'
        ? `/runtime/object/${selectedObject?.name ?? objectName}`
        : url;
    const nextApi: StudioCustomApiDraft = {
      code: toMetadataCode(label),
      label: label.trim() || 'API Connector',
      method: source === 'QUERY' || source === 'OBJECT' ? 'GET' : method,
      url: generatedUrl,
      auth,
      mappedAction,
      objectName: source === 'OBJECT' ? selectedObject?.name ?? objectName : undefined,
      queryCode: source === 'QUERY' ? selectedQuery?.code ?? queryCode : undefined,
      source,
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
        <h3>API Builder <HelpTip label="API Builder" text="Generated API berasal dari Data Object. External connector tetap dipanggil melalui Action step." /></h3>
        <p>Kelola generated runtime API dan connector external tanpa membuat controller hardcoded.</p>
      </div>

      <section className="redos-data-application-context">
        <label>
          <span>Application</span>
          <select value={selectedApplicationCode} onChange={(event) => selectApplication(event.target.value)}>
            {applications.map((application) => (
              <option key={application.code} value={application.code}>{application.name}</option>
            ))}
          </select>
          <small>API connector yang dibuat akan tersimpan untuk aplikasi ini.</small>
        </label>
        <div>
          <span className="redos-kicker">Active API Scope</span>
          <strong>{selectedApplication?.name ?? selectedApplicationCode}</strong>
          <small>{queries.length} queries · {customApis.length} API connectors · {actions.length} actions available</small>
        </div>
      </section>

      <section className="redos-tree-object">
        <header><strong>Generated API From Metadata</strong><span>query/object runtime-owned</span></header>
        {generatedApis.map((api) => (
          <div key={api} className="redos-list-row"><strong>{api}</strong><span>generated</span></div>
        ))}
      </section>

      <div className="redos-designer-form">
        <label>
          API Connector Name <HelpTip label="API Connector Name" text="Nama integrasi yang mudah dipahami admin, misalnya Sync Asset to Finance." />
          <input value={label} onChange={(event) => setLabel(event.target.value)} />
        </label>
        <label>
          API Source
          <select value={source} onChange={(event) => setSource(event.target.value as NonNullable<StudioCustomApiDraft['source']>)}>
            <option value="QUERY">Query Metadata</option>
            <option value="OBJECT">Data Object Metadata</option>
            <option value="EXTERNAL">External Connector</option>
          </select>
          <small>Query Builder menjadi dasar API Builder untuk endpoint data reusable.</small>
        </label>
        {source === 'QUERY' ? (
          <label>
            Query
            <select value={selectedQuery?.code ?? queryCode} onChange={(event) => setQueryCode(event.target.value)}>
              {queries.map((query) => <option key={query.code} value={query.code}>{query.label} · {query.code}</option>)}
            </select>
            <small>{selectedQuery?.sqlPreview ?? 'Belum ada SQL preview dari Query Builder.'}</small>
          </label>
        ) : null}
        {source === 'OBJECT' ? (
          <label>
            Data Object
            <select value={selectedObject?.name ?? objectName} onChange={(event) => setObjectName(event.target.value)}>
              {dataObjects.map((object) => <option key={object.name} value={object.name}>{object.name}</option>)}
            </select>
          </label>
        ) : null}
        <label>
          URL <HelpTip label="Connector URL" text="Alamat sistem eksternal. Ini tidak ditampilkan ke business user di Visual Builder." />
          <input
            readOnly={source !== 'EXTERNAL'}
            value={source === 'QUERY'
              ? `/runtime/query/${selectedQuery?.code ?? queryCode}`
              : source === 'OBJECT'
                ? `/runtime/object/${selectedObject?.name ?? objectName}`
                : url}
            onChange={(event) => setUrl(event.target.value)}
          />
        </label>
        <div className="redos-inline-form">
          <select data-redos-tooltip="HTTP method untuk connector custom." disabled={source !== 'EXTERNAL'} value={source === 'EXTERNAL' ? method : 'GET'} onChange={(event) => setMethod(event.target.value as StudioCustomApiDraft['method'])}>
            {methods.map((nextMethod) => <option key={nextMethod}>{nextMethod}</option>)}
          </select>
          <select data-redos-tooltip="Mode auth yang nanti dipakai runtime connector." value={auth} onChange={(event) => setAuth(event.target.value as StudioCustomApiDraft['auth'])}>
            {authModes.map((mode) => <option key={mode}>{mode}</option>)}
          </select>
          <select data-redos-tooltip="Action yang boleh memakai connector ini sebagai step." value={mappedAction} onChange={(event) => setMappedAction(event.target.value)}>
            {actions.map((action) => <option key={action.code} value={action.code}>{action.label}</option>)}
          </select>
        </div>
        <button className="redos-primary-action" data-redos-tooltip="Simpan API connector agar bisa dipakai sebagai Action step." type="button" onClick={saveApi}>Save API Connector</button>
      </div>

      <div className="redos-metadata-list">
        {customApis.map((api) => (
          <div key={api.code} className="redos-list-row">
            <span>
              <strong>{api.label}</strong>
              <small>{api.method} · {api.url} · source: {api.source ?? 'EXTERNAL'} · query: {api.queryCode ?? '-'} · Action: {api.mappedAction || 'not mapped'}</small>
            </span>
            <button data-redos-tooltip="Hapus API connector custom dari draft metadata lokal." type="button" onClick={() => setPendingDelete(api)}>Delete</button>
          </div>
        ))}
      </div>
      {pendingDelete ? (
        <MetadataConfirmDeleteModal
          title="Delete API Connector?"
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
