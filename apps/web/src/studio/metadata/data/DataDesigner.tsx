import { useState } from 'react';
import { HelpTip } from '../../guide/AdminGuide';
import { loadDataObjects, saveDataObjects, type StudioDataAttribute, type StudioDataObject } from '../metadata-store';

const attributeTypes: StudioDataAttribute['type'][] = ['text', 'number', 'date', 'boolean', 'lookup'];

export function DataDesigner() {
  const [objects, setObjects] = useState(() => loadDataObjects());
  const [objectName, setObjectName] = useState('Asset');
  const [attributeName, setAttributeName] = useState('serialNumber');
  const [attributeType, setAttributeType] = useState<StudioDataAttribute['type']>('text');

  function persist(nextObjects: StudioDataObject[]) {
    setObjects(nextObjects);
    saveDataObjects(nextObjects);
  }

  function addObject() {
    const name = objectName.trim();

    if (!name || objects.some((object) => object.name === name)) {
      return;
    }

    persist([{ name, attributes: [] }, ...objects]);
  }

  function addAttribute(objectNameValue: string) {
    const name = attributeName.trim();

    if (!name) {
      return;
    }

    persist(objects.map((object) => {
      if (object.name !== objectNameValue || object.attributes.some((attribute) => attribute.name === name)) {
        return object;
      }

      return {
        ...object,
        attributes: [...object.attributes, { name, type: attributeType }],
      };
    }));
  }

  function removeObject(name: string) {
    persist(objects.filter((object) => object.name !== name));
  }

  function removeAttribute(objectNameValue: string, attributeNameValue: string) {
    persist(objects.map((object) => object.name === objectNameValue ? {
      ...object,
      attributes: object.attributes.filter((attribute) => attribute.name !== attributeNameValue),
    } : object));
  }

  return (
    <section className="redos-metadata-card">
      <div className="redos-panel-heading">
        <span className="redos-kicker">DATA</span>
        <h3>Data Designer <HelpTip label="Data Designer" text="Buat Object dan Attribute yang nanti muncul sebagai pilihan Data Binding di builder." /></h3>
        <p>Gunakan saat admin perlu data baru untuk screen atau form.</p>
      </div>

      <div className="redos-inline-form">
        <input data-redos-tooltip="Contoh Object: Product, Asset, Customer, Ticket." value={objectName} onChange={(event) => setObjectName(event.target.value)} placeholder="Object name" />
        <button data-redos-tooltip="Buat Object baru agar bisa dipakai oleh Data Binding di Visual Builder." type="button" onClick={addObject}>Create Object</button>
      </div>

      <div className="redos-inline-form">
        <input data-redos-tooltip="Contoh Attribute: name, stock, serialNumber, status." value={attributeName} onChange={(event) => setAttributeName(event.target.value)} placeholder="Attribute name" />
        <select data-redos-tooltip="Tipe ini membantu runtime memilih input dan validasi yang sesuai." value={attributeType} onChange={(event) => setAttributeType(event.target.value as StudioDataAttribute['type'])}>
          {attributeTypes.map((type) => <option key={type}>{type}</option>)}
        </select>
      </div>

      <div className="redos-metadata-list">
        {objects.map((object) => (
          <section key={object.name} className="redos-tree-object">
            <header>
              <strong>{object.name}</strong>
              <button data-redos-tooltip="Hapus Object dari draft metadata lokal." type="button" onClick={() => removeObject(object.name)}>Delete Object</button>
            </header>
            {object.attributes.map((attribute) => (
              <div key={attribute.name} className="redos-list-row">
                <span><strong>{attribute.name}</strong><small>Attribute {attribute.type}</small></span>
                <button data-redos-tooltip="Hapus Attribute ini dari Object." type="button" onClick={() => removeAttribute(object.name, attribute.name)}>Delete</button>
              </div>
            ))}
            <button data-redos-tooltip={`Tambahkan Attribute ${attributeName || 'baru'} ke ${object.name}.`} type="button" onClick={() => addAttribute(object.name)}>Add Attribute Here</button>
          </section>
        ))}
      </div>
    </section>
  );
}
