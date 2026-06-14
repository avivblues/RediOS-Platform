import { useState } from 'react';
import { HelpTip } from '../../guide/AdminGuide';
import {
  loadSecurity,
  loadStudioApplications,
  resolveActiveApplicationCode,
  saveSecurity,
  setActiveApplicationCode,
  toMetadataCode,
  type StudioSecurityDraft,
} from '../metadata-store';
import { MetadataConfirmDeleteModal } from '../shared/MetadataConfirmDeleteModal';

export function SecurityDesigner() {
  const applications = loadStudioApplications();
  const activeApplicationCode = resolveActiveApplicationCode();
  const initialApplication = applications.find((application) => application.code === activeApplicationCode) ?? applications[0];
  const [selectedApplicationCode, setSelectedApplicationCode] = useState(initialApplication?.code ?? 'INVENTORY');
  const [security, setSecurity] = useState<StudioSecurityDraft>(() => loadSecurity(initialApplication?.code));
  const [label, setLabel] = useState('Power User');
  const [permissions, setPermissions] = useState('product.view, product.create, layout.customize');
  const [actionAccess, setActionAccess] = useState('SAVE_PRODUCT');
  const [powerUser, setPowerUser] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<StudioSecurityDraft['roles'][number]>();
  const selectedApplication = applications.find((application) => application.code === selectedApplicationCode);

  function persist(nextSecurity: StudioSecurityDraft) {
    setSecurity(nextSecurity);
    saveSecurity(nextSecurity, selectedApplicationCode);
  }

  function selectApplication(appCode: string) {
    const nextApplication = applications.find((application) => application.code === appCode);

    setSelectedApplicationCode(appCode);
    setSecurity(loadSecurity(appCode));
    if (nextApplication) {
      setActiveApplicationCode(nextApplication.target, nextApplication.code);
    }
  }

  function addRole() {
    const code = toMetadataCode(label);
    const nextRole = {
      code,
      label: label.trim() || 'Role',
      permissions: splitCsv(permissions),
      fieldAccess: {},
      actionAccess: splitCsv(actionAccess),
      powerUser,
    };

    persist({
      roles: [nextRole, ...security.roles.filter((role) => role.code !== code)],
    });
  }

  function removeRole(code: string) {
    persist({ roles: security.roles.filter((role) => role.code !== code) });
  }

  return (
    <section className="redos-metadata-card">
      <div className="redos-panel-heading">
        <span className="redos-kicker">Security</span>
        <h3>Security Designer <HelpTip label="Security Designer" text="Atur Role, Permission, Field Access, Action Access, dan Power User boundary." /></h3>
        <p>Security metadata menjaga power user tetap bisa konfigurasi tanpa merusak core system metadata atau API contract.</p>
      </div>

      <section className="redos-data-application-context">
        <label>
          <span>Application</span>
          <select value={selectedApplicationCode} onChange={(event) => selectApplication(event.target.value)}>
            {applications.map((application) => (
              <option key={application.code} value={application.code}>{application.name}</option>
            ))}
          </select>
          <small>Role dan permission akan tersimpan untuk aplikasi ini.</small>
        </label>
        <div>
          <span className="redos-kicker">Active Security Scope</span>
          <strong>{selectedApplication?.name ?? selectedApplicationCode}</strong>
          <small>{security.roles.length} roles configured</small>
        </div>
      </section>

      <div className="redos-designer-form">
        <label>
          Role Name
          <input value={label} onChange={(event) => setLabel(event.target.value)} />
        </label>
        <label>
          Permissions
          <textarea value={permissions} onChange={(event) => setPermissions(event.target.value)} />
        </label>
        <label>
          Action Access
          <textarea value={actionAccess} onChange={(event) => setActionAccess(event.target.value)} />
        </label>
        <label className="redos-decision-preview">
          <input checked={powerUser} type="checkbox" onChange={(event) => setPowerUser(event.target.checked)} />
          Power User can extend layout, fields, automation, approval, and reports
        </label>
        <button className="redos-primary-action" type="button" onClick={addRole}>Save Role</button>
      </div>

      <div className="redos-metadata-list">
        {security.roles.map((role) => (
          <section key={role.code} className="redos-tree-object">
            <header>
              <span>
                <strong>{role.label}</strong>
                <small>{role.code}{role.powerUser ? ' · Power User' : ''}</small>
              </span>
              <button type="button" onClick={() => setPendingDelete(role)}>Delete Role</button>
            </header>
            <div className="redos-list-row">
              <span>
                <strong>Permissions</strong>
                <small>{role.permissions.join(', ') || 'No permissions'}</small>
              </span>
            </div>
            <div className="redos-list-row">
              <span>
                <strong>Action Access</strong>
                <small>{role.actionAccess.join(', ') || 'No actions'}</small>
              </span>
            </div>
          </section>
        ))}
      </div>
      {pendingDelete ? (
        <MetadataConfirmDeleteModal
          title="Delete Role?"
          target={pendingDelete.label}
          onCancel={() => setPendingDelete(undefined)}
          onConfirm={() => {
            removeRole(pendingDelete.code);
            setPendingDelete(undefined);
          }}
        />
      ) : null}
    </section>
  );
}

function splitCsv(value: string) {
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}
