import { useState } from 'react';
import { HelpTip } from '../../guide/AdminGuide';
import { loadMenu, saveMenu, toMetadataCode, toApplicationSlug, type StudioMenuDraft } from '../metadata-store';

export function MenuDesigner() {
  const [menuItems, setMenuItems] = useState(() => loadMenu());
  const [label, setLabel] = useState('Product');
  const [parent, setParent] = useState('inventory');
  const [screen, setScreen] = useState('product-screen');
  const [permission, setPermission] = useState('product.view');

  function persist(nextMenu: StudioMenuDraft[]) {
    setMenuItems(nextMenu);
    saveMenu(nextMenu);
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
          Screen Code
          <input value={screen} onChange={(event) => setScreen(event.target.value)} />
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
            <button type="button" onClick={() => removeMenuItem(item.id)}>Delete</button>
          </div>
        ))}
      </div>
    </section>
  );
}
