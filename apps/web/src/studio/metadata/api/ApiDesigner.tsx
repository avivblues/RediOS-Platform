import { useState } from 'react';
import { HelpTip } from '../../guide/AdminGuide';
import { loadActions, loadCustomApis, saveCustomApis, toMetadataCode, type StudioCustomApiDraft } from '../metadata-store';

const generatedApis = ['GET Product', 'POST Product', 'PUT Product', 'DELETE Product'];
const methods: StudioCustomApiDraft['method'][] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const authModes: StudioCustomApiDraft['auth'][] = ['None', 'API Key', 'Bearer Token'];

export function ApiDesigner() {
  const [customApis, setCustomApis] = useState(() => loadCustomApis());
  const [label, setLabel] = useState('Sync Asset to Finance');
  const [method, setMethod] = useState<StudioCustomApiDraft['method']>('POST');
  const [url, setUrl] = useState('https://finance.example.com/assets');
  const [auth, setAuth] = useState<StudioCustomApiDraft['auth']>('Bearer Token');
  const [mappedAction, setMappedAction] = useState('SAVE_PRODUCT');
  const actions = loadActions();

  function persist(nextApis: StudioCustomApiDraft[]) {
    setCustomApis(nextApis);
    saveCustomApis(nextApis);
  }

  function saveApi() {
    const nextApi: StudioCustomApiDraft = {
      code: toMetadataCode(label),
      label: label.trim() || 'Custom API',
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
        <h3>API & Connector Designer <HelpTip label="Custom Connector" text="Gunakan hanya untuk integrasi custom. Di builder, user tetap memilih Action." /></h3>
        <p>Generated API tetap runtime-owned. Custom API dipanggil melalui Action step.</p>
      </div>

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
        <button className="redos-primary-action" data-redos-tooltip="Simpan connector agar bisa dipakai sebagai Action step." type="button" onClick={saveApi}>Save Custom API</button>
      </div>

      <div className="redos-metadata-list">
        {customApis.map((api) => (
          <div key={api.code} className="redos-list-row">
            <span>
              <strong>{api.label}</strong>
              <small>{api.method} · {api.url} · Action: {api.mappedAction || 'not mapped'}</small>
            </span>
            <button data-redos-tooltip="Hapus connector custom dari draft metadata lokal." type="button" onClick={() => removeApi(api.code)}>Delete</button>
          </div>
        ))}
      </div>
    </section>
  );
}
