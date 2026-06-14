import { useState } from 'react';
import { HelpTip } from '../../guide/AdminGuide';
import {
  loadMenu,
  loadScreens,
  loadStudioApplications,
  resolveActiveApplicationCode,
  saveMenu,
  setActiveApplicationCode,
  toApplicationSlug,
  toMetadataCode,
  type StudioApplicationDraft,
  type StudioMenuDraft,
} from '../metadata-store';
import { MetadataConfirmDeleteModal } from '../shared/MetadataConfirmDeleteModal';

export function MenuDesigner() {
  const applications = loadStudioApplications();
  const activeApplicationCode = resolveActiveApplicationCode();
  const initialApplication = applications.find((application) => application.code === activeApplicationCode) ?? applications[0];
  const [selectedApplicationCode, setSelectedApplicationCode] = useState(initialApplication?.code ?? 'INVENTORY');
  const [selectedApplication, setSelectedApplication] = useState<StudioApplicationDraft | undefined>(initialApplication);
  const [screens, setScreens] = useState(() => loadScreens(initialApplication?.code));
  const [menuItems, setMenuItems] = useState(() => loadMenu(initialApplication?.code));
  const [label, setLabel] = useState('Product');
  const [parent, setParent] = useState('inventory');
  const [screen, setScreen] = useState(screens[0]?.code ?? 'product-screen');
  const [permission, setPermission] = useState('product.view');
  const [pendingDelete, setPendingDelete] = useState<StudioMenuDraft>();

  function persist(nextMenu: StudioMenuDraft[]) {
    setMenuItems(nextMenu);
    saveMenu(nextMenu, selectedApplicationCode);
  }

  function selectApplication(appCode: string) {
    const nextApplication = applications.find((application) => application.code === appCode);
    const nextScreens = loadScreens(appCode);

    setSelectedApplicationCode(appCode);
    setSelectedApplication(nextApplication);
    if (nextApplication) {
      setActiveApplicationCode(nextApplication.target, nextApplication.code);
    }
    setScreens(nextScreens);
    setMenuItems(loadMenu(appCode));
    setScreen(nextScreens[0]?.code ?? '');
  }

  function addMenuItem() {
    const id = toApplicationSlug(`${parent}-${label}`);
    const cleanLabel = label.trim() || 'Menu';
    const nextItem: StudioMenuDraft = {
      id,
      label: cleanLabel,
      route: `/${toApplicationSlug(cleanLabel)}`,
      screen: screen.trim() || `${toApplicationSlug(cleanLabel)}-screen`,
      permission: permission.trim() || `${toMetadataCode(cleanLabel).toLowerCase()}.view`,
      parent: parent.trim() || undefined,
    };

    persist([nextItem, ...menuItems.filter((item) => item.id !== id)]);
  }

  function removeMenuItem(id: string) {
    persist(menuItems.filter((item) => item.id !== id));
  }

  return (
    <section className="redos-metadata-card">
      <div className="redos-panel-heading">
        <span className="redos-kicker">Menu</span>
        <h3>Menu Designer <HelpTip label="Menu Designer" text="Menu metadata menentukan navigasi aplikasi yang dihasilkan, termasuk permission guard." /></h3>
        <p>Bangun header/sidebar/menu runtime dari metadata, bukan hardcoded navigation.</p>
      </div>

      <section className="redos-data-application-context">
        <label>
          <span>Application</span>
          <select value={selectedApplicationCode} onChange={(event) => selectApplication(event.target.value)}>
            {applications.map((application) => (
              <option key={application.code} value={application.code}>{application.name}</option>
            ))}
          </select>
          <small>Menu yang dibuat akan tersimpan untuk aplikasi ini.</small>
        </label>
        <div>
          <span className="redos-kicker">Active Menu Scope</span>
          <strong>{selectedApplication?.name ?? selectedApplicationCode}</strong>
          <small>{screens.length} screen/forms available</small>
        </div>
      </section>

      <div className="redos-designer-form">
        <label>
          Menu Label
          <input value={label} onChange={(event) => setLabel(event.target.value)} />
        </label>
        <label>
          Parent Menu ID
          <input value={parent} onChange={(event) => setParent(event.target.value)} placeholder="empty for root" />
        </label>
        <label>
          Screen / Form
          <select value={screen} onChange={(event) => setScreen(event.target.value)}>
            {screens.length === 0 ? <option value="">No screen registered</option> : null}
            {screens.map((screenItem) => (
              <option key={screenItem.code} value={screenItem.code}>{screenItem.label}</option>
            ))}
          </select>
        </label>
        <label>
          Permission
          <input value={permission} onChange={(event) => setPermission(event.target.value)} />
        </label>
        <button className="redos-primary-action" type="button" onClick={addMenuItem}>Add Menu</button>
      </div>

      <div className="redos-metadata-list">
        {menuItems.map((item) => (
          <div key={item.id} className="redos-list-row">
            <span>
              <strong>{item.parent ? `${item.parent} > ${item.label}` : item.label}</strong>
              <small>{item.route} · screen: {item.screen} · permission: {item.permission}</small>
            </span>
            <button type="button" onClick={() => setPendingDelete(item)}>Delete</button>
          </div>
        ))}
      </div>
      {pendingDelete ? (
        <MetadataConfirmDeleteModal
          title="Delete Menu?"
          target={pendingDelete.label}
          onCancel={() => setPendingDelete(undefined)}
          onConfirm={() => {
            removeMenuItem(pendingDelete.id);
            setPendingDelete(undefined);
          }}
        />
      ) : null}
    </section>
  );
}
