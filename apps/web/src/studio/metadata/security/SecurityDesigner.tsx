import { useState } from 'react';
import { HelpTip } from '../../guide/AdminGuide';
import { loadSecurity, saveSecurity, toMetadataCode, type StudioSecurityDraft } from '../metadata-store';

export function SecurityDesigner() {
  const [security, setSecurity] = useState<StudioSecurityDraft>(() => loadSecurity());
  const [label, setLabel] = useState('Power User');
  const [permissions, setPermissions] = useState('product.view, product.create, layout.customize');
  const [actionAccess, setActionAccess] = useState('SAVE_PRODUCT');
  const [powerUser, setPowerUser] = useState(true);

  function persist(nextSecurity: StudioSecurityDraft) {
    setSecurity(nextSecurity);
    saveSecurity(nextSecurity);
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
              <button type="button" onClick={() => removeRole(role.code)}>Delete Role</button>
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
    </section>
  );
}

function splitCsv(value: string) {
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}
