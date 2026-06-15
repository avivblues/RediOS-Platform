import { type MouseEvent, type ReactNode, useState } from 'react';
import { HelpTip } from '../../guide/AdminGuide';
import {
  loadDataObjects,
  loadStudioApplications,
  resolveActiveApplicationCode,
  saveDataObjects,
  setActiveApplicationCode,
  type StudioApplicationDraft,
  type StudioDataAttribute,
  type StudioDataObject,
} from '../metadata-store';

const attributeTypes: Array<{ value: StudioDataAttribute['type']; label: string; description: string }> = [
  { value: 'string', label: 'String', description: 'Teks pendek untuk kode, username, atau identifier bisnis' },
  { value: 'text', label: 'Text', description: 'Nama, kode, status, catatan pendek' },
  { value: 'longText', label: 'Long Text', description: 'Catatan panjang, deskripsi, instruksi' },
  { value: 'number', label: 'Number', description: 'Angka umum tanpa format khusus' },
  { value: 'integer', label: 'Integer', description: 'Bilangan bulat seperti stok atau kuantitas' },
  { value: 'decimal', label: 'Decimal', description: 'Angka desimal untuk pengukuran atau nilai presisi' },
  { value: 'double', label: 'Double', description: 'Angka presisi tinggi untuk kalkulasi teknis' },
  { value: 'currency', label: 'Currency', description: 'Nominal uang seperti harga, biaya, dan nilai transaksi' },
  { value: 'percentage', label: 'Percentage', description: 'Persentase diskon, pajak, progress, atau rasio' },
  { value: 'date', label: 'Date', description: 'Tanggal dokumen atau transaksi' },
  { value: 'time', label: 'Time', description: 'Jam operasional, jadwal, atau SLA' },
  { value: 'datetime', label: 'Date & Time', description: 'Tanggal dan jam dalam satu attribute' },
  { value: 'boolean', label: 'Boolean', description: 'Ya/tidak, aktif/nonaktif' },
  { value: 'email', label: 'Email', description: 'Alamat email dengan validasi format' },
  { value: 'phone', label: 'Phone', description: 'Nomor telepon atau kontak' },
  { value: 'url', label: 'URL', description: 'Alamat web atau endpoint referensi' },
  { value: 'lookup', label: 'Lookup', description: 'Relasi ke data object lain' },
  { value: 'json', label: 'JSON', description: 'Data fleksibel seperti konfigurasi atau payload API' },
  { value: 'file', label: 'File', description: 'Dokumen atau lampiran' },
  { value: 'image', label: 'Image', description: 'Foto produk, bukti, atau gambar pendukung' },
  { value: 'uuid', label: 'UUID', description: 'Identifier unik yang dibuat runtime' },
  { value: 'password', label: 'Password', description: 'Field rahasia yang disimpan oleh provider password' },
  { value: 'enum', label: 'Enum', description: 'Pilihan nilai tetap seperti ACTIVE, INACTIVE, LOCKED' },
];

type DeleteConfirmation =
  | { kind: 'object'; objectName: string }
  | { kind: 'attribute'; objectName: string; attributeName: string };

type CreateObjectConfirmation = { objectName: string };
type SaveObjectConfirmation = { originalName: string; nextName: string };
type AddAttributeConfirmation = { objectName: string; attribute: StudioDataAttribute };
type SaveAttributeConfirmation = { objectName: string; originalName: string; attribute: StudioDataAttribute };

export function DataDesigner() {
  const applications = loadStudioApplications();
  const activeApplicationCode = resolveActiveApplicationCode();
  const initialApplication = applications.find((application) => application.code === activeApplicationCode) ?? applications[0];
  const [selectedApplicationCode, setSelectedApplicationCode] = useState(initialApplication?.code ?? 'INVENTORY');
  const [selectedApplication, setSelectedApplication] = useState<StudioApplicationDraft | undefined>(initialApplication);
  const initialObjects = loadDataObjects(selectedApplicationCode);
  const [objects, setObjects] = useState(initialObjects);
  const [selectedObjectName, setSelectedObjectName] = useState(initialObjects[0]?.name ?? '');
  const [selectedAttributeName, setSelectedAttributeName] = useState('');
  const [editingObjectName, setEditingObjectName] = useState('');
  const [editingAttributeName, setEditingAttributeName] = useState('');
  const [objectName, setObjectName] = useState(initialObjects[0]?.name ?? 'Asset');
  const [objectEditName, setObjectEditName] = useState(initialObjects[0]?.name ?? 'Asset');
  const [attributeName, setAttributeName] = useState('');
  const [attributeType, setAttributeType] = useState<StudioDataAttribute['type']>('text');
  const [attributeEditName, setAttributeEditName] = useState('');
  const [attributeEditType, setAttributeEditType] = useState<StudioDataAttribute['type']>('text');
  const [createObjectConfirmation, setCreateObjectConfirmation] = useState<CreateObjectConfirmation>();
  const [saveObjectConfirmation, setSaveObjectConfirmation] = useState<SaveObjectConfirmation>();
  const [addAttributeConfirmation, setAddAttributeConfirmation] = useState<AddAttributeConfirmation>();
  const [saveAttributeConfirmation, setSaveAttributeConfirmation] = useState<SaveAttributeConfirmation>();
  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmation>();
  const selectedObject = objects.find((object) => object.name === selectedObjectName);

  function persist(nextObjects: StudioDataObject[]) {
    setObjects(nextObjects);
    saveDataObjects(nextObjects, selectedApplicationCode);
  }

  function selectApplication(appCode: string) {
    const nextApplication = applications.find((application) => application.code === appCode);
    const nextObjects = loadDataObjects(appCode);
    const nextObject = nextObjects[0];

    setSelectedApplicationCode(appCode);
    setSelectedApplication(nextApplication);
    if (nextApplication) {
      setActiveApplicationCode(nextApplication.target, nextApplication.code);
    }
    setObjects(nextObjects);
    setSelectedObjectName(nextObject?.name ?? '');
    setEditingObjectName('');
    setObjectName(nextObject?.name ?? '');
    setObjectEditName(nextObject?.name ?? '');
    resetAttributeForm();
  }

  function requestCreateObject() {
    const name = objectName.trim();

    if (!name) {
      return;
    }

    if (objects.some((object) => object.name === name)) {
      selectObject(name);
      return;
    }

    setCreateObjectConfirmation({ objectName: name });
  }

  function addObject(name: string) {
    persist([{ name, attributes: [] }, ...objects]);
    setSelectedObjectName(name);
    setEditingObjectName('');
    setObjectName(name);
    setObjectEditName(name);
    resetAttributeForm();
    setCreateObjectConfirmation(undefined);
  }

  function requestAddAttribute() {
    const name = attributeName.trim();
    const objectNameValue = selectedObject?.name;

    if (!name || !objectNameValue) {
      return;
    }

    if (selectedObject.attributes.some((attribute) => attribute.name === name)) {
      const attribute = selectedObject.attributes.find((item) => item.name === name);

      if (attribute) {
        selectAttribute(attribute);
      }
      return;
    }

    setAddAttributeConfirmation({ objectName: objectNameValue, attribute: { name, type: attributeType } });
  }

  function addAttribute(objectNameValue: string, attribute: StudioDataAttribute) {
    persist(objects.map((object) => {
      if (object.name !== objectNameValue || object.attributes.some((current) => current.name === attribute.name)) {
        return object;
      }

      return {
        ...object,
        attributes: [...object.attributes, attribute],
      };
    }));
    setSelectedAttributeName(attribute.name);
    setEditingAttributeName('');
    setAttributeEditName(attribute.name);
    setAttributeEditType(attribute.type);
    setAddAttributeConfirmation(undefined);
  }

  function removeObject(name: string) {
    const object = objects.find((item) => item.name === name);

    if (isLockedObject(object)) {
      return;
    }

    const nextObjects = objects.filter((object) => object.name !== name);
    persist(nextObjects);

    const nextSelectedObject = nextObjects[0];
    setSelectedObjectName(nextSelectedObject?.name ?? '');
    setEditingObjectName('');
    setObjectName(nextSelectedObject?.name ?? '');
    setObjectEditName(nextSelectedObject?.name ?? '');
    resetAttributeForm();
  }

  function removeAttribute(objectNameValue: string, attributeNameValue: string) {
    const object = objects.find((item) => item.name === objectNameValue);
    const attribute = object?.attributes.find((item) => item.name === attributeNameValue);

    if (isLockedAttribute(attribute)) {
      return;
    }

    persist(objects.map((object) => object.name === objectNameValue ? {
      ...object,
      attributes: object.attributes.filter((attribute) => attribute.name !== attributeNameValue),
    } : object));

    if (selectedAttributeName === attributeNameValue) {
      resetAttributeForm();
    }

    if (editingAttributeName === attributeNameValue) {
      setEditingAttributeName('');
    }
  }

  function selectObject(name: string) {
    const object = objects.find((item) => item.name === name);

    if (!object) {
      return;
    }

    setSelectedObjectName(object.name);
    setEditingObjectName('');
    setObjectName(object.name);
    setObjectEditName(object.name);
    setSelectedAttributeName('');
    setAttributeName('');
    setAttributeType('text');
    setAttributeEditName('');
    setAttributeEditType('text');
  }

  function requestSaveSelectedObject() {
    if (!selectedObject) {
      return;
    }

    if (isLockedObject(selectedObject)) {
      setEditingObjectName('');
      setObjectEditName(selectedObject.name);
      return;
    }

    const nextName = objectEditName.trim();

    if (!nextName || objects.some((object) => object.name === nextName && object.name !== selectedObject.name)) {
      return;
    }

    setSaveObjectConfirmation({ originalName: selectedObject.name, nextName });
  }

  function saveSelectedObject(originalName: string, nextName: string) {
    persist(objects.map((object) => object.name === originalName ? { ...object, name: nextName } : object));
    setSelectedObjectName(nextName);
    setObjectName(nextName);
    setObjectEditName(nextName);
    setEditingObjectName('');
    setSaveObjectConfirmation(undefined);
  }

  function selectAttribute(attribute: StudioDataAttribute) {
    setSelectedAttributeName(attribute.name);
    setAttributeName(attribute.name);
    setAttributeType(attribute.type);
    setEditingAttributeName('');
    setAttributeEditName(attribute.name);
    setAttributeEditType(attribute.type);
  }

  function startEditObject(object: StudioDataObject) {
    setSelectedObjectName(object.name);
    setEditingObjectName(object.name);
    setObjectName(object.name);
    setObjectEditName(object.name);
    resetAttributeForm();
  }

  function startEditAttribute(attribute: StudioDataAttribute) {
    setSelectedAttributeName(attribute.name);
    setEditingAttributeName(attribute.name);
    setAttributeName(attribute.name);
    setAttributeType(attribute.type);
    setAttributeEditName(attribute.name);
    setAttributeEditType(attribute.type);
  }

  function requestSaveSelectedAttribute() {
    if (!selectedObject || !selectedAttributeName) {
      return;
    }

    const currentAttribute = selectedObject.attributes.find((attribute) => attribute.name === selectedAttributeName);

    if (currentAttribute && isLockedAttribute(currentAttribute)) {
      setEditingAttributeName('');
      setAttributeEditName(currentAttribute.name);
      setAttributeEditType(currentAttribute.type);
      return;
    }

    const nextName = attributeEditName.trim();

    if (!nextName) {
      return;
    }

    if (selectedObject.attributes.some((attribute) => attribute.name === nextName && attribute.name !== selectedAttributeName)) {
      return;
    }

    setSaveAttributeConfirmation({
      objectName: selectedObject.name,
      originalName: selectedAttributeName,
      attribute: { name: nextName, type: attributeEditType },
    });
  }

  function saveSelectedAttribute(confirmation: SaveAttributeConfirmation) {
    persist(objects.map((object) => {
      if (object.name !== confirmation.objectName) {
        return object;
      }

      return {
        ...object,
        attributes: object.attributes.map((attribute) => attribute.name === confirmation.originalName ? confirmation.attribute : attribute),
      };
    }));
    setSelectedAttributeName(confirmation.attribute.name);
    setEditingAttributeName('');
    setAttributeName(confirmation.attribute.name);
    setAttributeType(confirmation.attribute.type);
    setAttributeEditName(confirmation.attribute.name);
    setAttributeEditType(confirmation.attribute.type);
    setSaveAttributeConfirmation(undefined);
  }

  function confirmDelete() {
    if (!deleteConfirmation) {
      return;
    }

    if (deleteConfirmation.kind === 'object') {
      removeObject(deleteConfirmation.objectName);
    } else {
      removeAttribute(deleteConfirmation.objectName, deleteConfirmation.attributeName);
    }

    setDeleteConfirmation(undefined);
  }

  function resetAttributeForm() {
    setSelectedAttributeName('');
    setEditingAttributeName('');
    setAttributeName('');
    setAttributeType('text');
    setAttributeEditName('');
    setAttributeEditType('text');
  }

  function handleObjectInput(value: string) {
    setObjectName(value);

    if (objects.some((object) => object.name === value)) {
      selectObject(value);
    } else {
      setSelectedObjectName('');
      resetAttributeForm();
    }
  }

  function handleAttributeInput(value: string) {
    setAttributeName(value);

    const attribute = selectedObject?.attributes.find((item) => item.name === value);

    if (attribute) {
      selectAttribute(attribute);
    } else {
      setSelectedAttributeName('');
    }
  }

  return (
    <section className="redos-metadata-card">
      <div className="redos-panel-heading">
        <span className="redos-kicker">DATA</span>
        <h3>Data Designer <HelpTip label="Data Designer" text="Buat Object dan Attribute yang nanti muncul sebagai pilihan Data Binding di builder." /></h3>
        <p>Gunakan saat admin perlu data baru untuk screen atau form.</p>
      </div>

      <section className="redos-data-application-context">
        <label>
          <span>Application</span>
          <select value={selectedApplicationCode} onChange={(event) => selectApplication(event.target.value)}>
            {applications.map((application) => (
              <option key={application.code} value={application.code}>{application.name}</option>
            ))}
          </select>
          <small>Data Object yang dibuat di sini akan tersimpan untuk aplikasi ini.</small>
        </label>
        <div>
          <span className="redos-kicker">Active Metadata Scope</span>
          <strong>{selectedApplication?.name ?? selectedApplicationCode}</strong>
          <small>{selectedApplicationCode} · {selectedApplication?.target ?? 'web'} runtime</small>
        </div>
      </section>

      <div className="redos-data-command-grid">
        <section className="redos-data-designer-form">
          <label>
            <span>Find / Create Object</span>
            <div className="redos-input-action-row">
              <input
                data-redos-tooltip="Ketik untuk cari Object. Pilih dari autocomplete atau isi nama baru."
                list="redos-data-object-options"
                value={objectName}
                onChange={(event) => handleObjectInput(event.target.value)}
                placeholder="Search or create object"
              />
              <ActionButton compact icon="add" label="Create Object" variant="primary" onClick={requestCreateObject} />
            </div>
            <datalist id="redos-data-object-options">
              {objects.map((object) => <option key={object.name} value={object.name} />)}
            </datalist>
            <small>{selectedObject ? `Selected: ${selectedObject.name}. Edit langsung di table.` : 'Ketik nama baru lalu Create Object.'}</small>
          </label>
        </section>

        <section className="redos-data-designer-form redos-data-attribute-form">
          <label>
            <span>New Attribute</span>
            <input
              data-redos-tooltip="Ketik untuk cari Attribute di Object terpilih. Pilih dari autocomplete atau isi nama baru."
              list="redos-data-attribute-options"
              value={attributeName}
              onChange={(event) => handleAttributeInput(event.target.value)}
              placeholder="Search or create attribute"
            />
            <datalist id="redos-data-attribute-options">
              {selectedObject?.attributes.map((attribute) => <option key={attribute.name} value={attribute.name} />)}
            </datalist>
            <small>{selectedAttributeName ? `Selected: ${selectedObject?.name}.${selectedAttributeName}. Edit langsung di table.` : `Target Object: ${selectedObject?.name ?? 'pilih object dulu'}`}</small>
          </label>
          <label>
            <span>Data Type</span>
            <div className="redos-input-action-row">
              <select data-redos-tooltip="Tipe ini membantu runtime memilih input dan validasi yang sesuai." value={attributeType} onChange={(event) => setAttributeType(event.target.value as StudioDataAttribute['type'])}>
                {attributeTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
              </select>
              <ActionButton compact disabled={!selectedObject} icon="add" label="Add Attribute" variant="primary" onClick={requestAddAttribute} />
            </div>
            <small>{attributeTypes.find((type) => type.value === attributeType)?.description}</small>
          </label>
        </section>
      </div>

      <div className="redos-data-master-detail">
        <section className="redos-tree-object redos-data-object-card">
          <header>
            <span>
              <strong>Data Objects</strong>
              <small>Pilih object yang ingin disesuaikan</small>
            </span>
          </header>
          <div className="redos-data-table" role="list" aria-label="Data objects">
            {objects.map((object) => (
              <div
                key={object.name}
                className={selectedObject?.name === object.name ? 'redos-data-table-row redos-data-table-row-active' : 'redos-data-table-row'}
                onClick={() => selectObject(object.name)}
              >
                {editingObjectName === object.name ? (
                  <>
                    <label className="redos-inline-table-field">
                      <span>Object Name</span>
                      <input
                        disabled={isLockedObject(object)}
                        value={objectEditName}
                        onChange={(event) => setObjectEditName(event.target.value)}
                        onClick={(event) => event.stopPropagation()}
                      />
                    </label>
                    <span className="redos-data-table-meta">{object.attributes.length} attributes {isLockedObject(object) ? '· SYSTEM_OBJECT' : ''}</span>
                    <span className="redos-data-row-actions">
                      <ActionButton compact disabled={isLockedObject(object)} icon="save" label="Save Object" onClick={(event) => {
                        event.stopPropagation();
                        requestSaveSelectedObject();
                      }}
                      />
                      <ActionButton compact danger disabled={isLockedObject(object)} icon="delete" label="Delete Object" onClick={(event) => {
                        event.stopPropagation();
                        setDeleteConfirmation({ kind: 'object', objectName: object.name });
                      }}
                      />
                    </span>
                  </>
                ) : (
                  <>
                    <span>
                      <strong>{object.name}</strong>
                      <small>{object.attributes.length} attributes {isLockedObject(object) ? '· SYSTEM_OBJECT locked' : ''}</small>
                    </span>
                    <span className="redos-data-chevron">{selectedObject?.name === object.name ? 'Selected' : 'Open'}</span>
                    <span className="redos-data-row-actions">
                      <ActionButton compact disabled={isLockedObject(object)} icon="edit" label="Edit Object" onClick={(event) => {
                        event.stopPropagation();
                        startEditObject(object);
                      }}
                      />
                      <ActionButton compact danger disabled={isLockedObject(object)} icon="delete" label="Delete Object" onClick={(event) => {
                        event.stopPropagation();
                        setDeleteConfirmation({ kind: 'object', objectName: object.name });
                      }}
                      />
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="redos-tree-object redos-data-object-card">
          <header>
            <span>
              <strong>{selectedObject?.name ?? 'No Object Selected'}</strong>
              <small>{selectedObject ? 'Klik attribute untuk edit nama atau tipe' : 'Pilih object dulu di tabel kiri'}</small>
            </span>
          </header>
          <div className="redos-data-attribute-list">
            {selectedObject?.attributes.map((attribute) => (
              <div
                key={attribute.name}
                className={selectedAttributeName === attribute.name ? 'redos-list-row redos-data-attribute-row redos-data-table-row-active' : 'redos-list-row redos-data-attribute-row'}
                onClick={() => selectAttribute(attribute)}
              >
                {editingAttributeName === attribute.name ? (
                  <>
                    <label className="redos-inline-table-field">
                      <span>Attribute Name</span>
                      <input
                        disabled={isLockedAttribute(attribute)}
                        value={attributeEditName}
                        onChange={(event) => setAttributeEditName(event.target.value)}
                        onClick={(event) => event.stopPropagation()}
                      />
                    </label>
                    <label className="redos-inline-table-field">
                      <span>Data Type</span>
                      <select
                        disabled={isLockedAttribute(attribute)}
                        value={attributeEditType}
                        onChange={(event) => setAttributeEditType(event.target.value as StudioDataAttribute['type'])}
                        onClick={(event) => event.stopPropagation()}
                      >
                        {attributeTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                      </select>
                    </label>
                    <span className="redos-data-row-actions">
                      <ActionButton compact disabled={isLockedAttribute(attribute)} icon="save" label="Save Attribute" onClick={(event) => {
                        event.stopPropagation();
                        requestSaveSelectedAttribute();
                      }}
                      />
                      <ActionButton compact danger disabled={isLockedAttribute(attribute)} icon="delete" label="Delete Attribute" onClick={(event) => {
                        event.stopPropagation();
                        setDeleteConfirmation({ kind: 'attribute', objectName: selectedObject.name, attributeName: attribute.name });
                      }}
                      />
                    </span>
                  </>
                ) : (
                  <>
                    <span>
                      <strong>{attribute.label ?? attribute.name}</strong>
                      <small>{attribute.name} · {isLockedAttribute(attribute) ? 'System Field locked' : 'Custom Field editable'}</small>
                    </span>
                    <span className={`redos-data-type-badge redos-data-type-${attribute.type}`}>{attribute.type}</span>
                    <span className="redos-data-row-actions">
                      <ActionButton compact disabled={isLockedAttribute(attribute)} icon="edit" label="Edit Attribute" onClick={(event) => {
                        event.stopPropagation();
                        startEditAttribute(attribute);
                      }}
                      />
                      <ActionButton compact danger disabled={isLockedAttribute(attribute)} icon="delete" label="Delete Attribute" onClick={(event) => {
                        event.stopPropagation();
                        setDeleteConfirmation({ kind: 'attribute', objectName: selectedObject.name, attributeName: attribute.name });
                      }}
                      />
                    </span>
                  </>
                )}
              </div>
            )) ?? null}
            {selectedObject && selectedObject.attributes.length === 0 ? (
              <div className="redos-data-empty-state">Belum ada attribute. Isi form Attribute lalu klik Add Attribute.</div>
            ) : null}
          </div>
        </section>
      </div>
      {createObjectConfirmation ? (
        <ConfirmActionModal
          confirmLabel="Create Object"
          kicker="Confirm Create"
          target={createObjectConfirmation.objectName}
          title="Create Object?"
          onCancel={() => setCreateObjectConfirmation(undefined)}
          onConfirm={() => addObject(createObjectConfirmation.objectName)}
        >
          Object baru akan dibuat di aplikasi <strong>{selectedApplication?.name ?? selectedApplicationCode}</strong> dan bisa dipakai untuk Data Binding.
        </ConfirmActionModal>
      ) : null}
      {saveObjectConfirmation ? (
        <ConfirmActionModal
          confirmLabel="Save Object"
          kicker="Confirm Save"
          target={`${saveObjectConfirmation.originalName} -> ${saveObjectConfirmation.nextName}`}
          title="Save Object Changes?"
          onCancel={() => setSaveObjectConfirmation(undefined)}
          onConfirm={() => saveSelectedObject(saveObjectConfirmation.originalName, saveObjectConfirmation.nextName)}
        >
          Nama Object akan diubah untuk aplikasi <strong>{selectedApplication?.name ?? selectedApplicationCode}</strong>.
        </ConfirmActionModal>
      ) : null}
      {addAttributeConfirmation ? (
        <ConfirmActionModal
          confirmLabel="Add Attribute"
          kicker="Confirm Create"
          target={`${addAttributeConfirmation.objectName}.${addAttributeConfirmation.attribute.name}`}
          title="Add Attribute?"
          onCancel={() => setAddAttributeConfirmation(undefined)}
          onConfirm={() => addAttribute(addAttributeConfirmation.objectName, addAttributeConfirmation.attribute)}
        >
          Attribute baru akan ditambahkan ke Object terpilih.
        </ConfirmActionModal>
      ) : null}
      {saveAttributeConfirmation ? (
        <ConfirmActionModal
          confirmLabel="Save Attribute"
          kicker="Confirm Save"
          target={`${saveAttributeConfirmation.objectName}.${saveAttributeConfirmation.originalName} -> ${saveAttributeConfirmation.attribute.name}`}
          title="Save Attribute Changes?"
          onCancel={() => setSaveAttributeConfirmation(undefined)}
          onConfirm={() => saveSelectedAttribute(saveAttributeConfirmation)}
        >
          Nama atau tipe Attribute akan diubah untuk Object terpilih.
        </ConfirmActionModal>
      ) : null}
      {deleteConfirmation ? (
        <ConfirmActionModal
          danger
          confirmLabel="Confirm Delete"
          confirmation={deleteConfirmation}
          kicker="Confirm Delete"
          onCancel={() => setDeleteConfirmation(undefined)}
          onConfirm={confirmDelete}
        />
      ) : null}
    </section>
  );
}

function isLockedObject(object?: StudioDataObject) {
  return Boolean(object?.locked || object?.type === 'SYSTEM_OBJECT');
}

function isLockedAttribute(attribute?: StudioDataAttribute) {
  return Boolean(attribute?.locked || attribute?.systemField);
}

function ActionButton({
  compact = false,
  danger = false,
  disabled = false,
  icon,
  label,
  variant,
  onClick,
}: {
  compact?: boolean;
  danger?: boolean;
  disabled?: boolean;
  icon: 'add' | 'delete' | 'edit' | 'save';
  label: string;
  variant?: 'primary';
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      aria-label={label}
      className={[
        compact ? 'redos-icon-action' : 'redos-labeled-action',
        variant === 'primary' ? 'redos-action-primary' : '',
        danger ? 'redos-action-danger' : '',
      ].filter(Boolean).join(' ')}
      data-redos-tooltip={label}
      disabled={disabled}
      type="button"
      onClick={onClick}
    >
      <IconGlyph icon={icon} />
      {!compact ? <span>{label}</span> : null}
    </button>
  );
}

function IconGlyph({ icon }: { icon: 'add' | 'delete' | 'edit' | 'save' }) {
  if (icon === 'add') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M12 5v14M5 12h14" />
      </svg>
    );
  }

  if (icon === 'save') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M5 13l4 4L19 7" />
      </svg>
    );
  }

  if (icon === 'edit') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M5 19l4-.8L18 9l-3-3-9 9-.8 4z" />
        <path d="M13 7l3 3" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M6 7h12" />
      <path d="M9 7V5h6v2" />
      <path d="M9 10v8M15 10v8" />
      <path d="M8 7l1 13h6l1-13" />
    </svg>
  );
}

function ConfirmActionModal({
  children,
  confirmation,
  confirmLabel,
  danger = false,
  kicker,
  onCancel,
  onConfirm,
  target,
  title,
}: {
  children?: ReactNode;
  confirmation?: DeleteConfirmation;
  confirmLabel: string;
  danger?: boolean;
  kicker: string;
  onCancel: () => void;
  onConfirm: () => void;
  target?: string;
  title?: string;
}) {
  const resolvedTitle = title ?? (confirmation?.kind === 'object' ? 'Delete Object?' : 'Delete Attribute?');
  const resolvedTarget = target ?? (confirmation?.kind === 'object'
    ? confirmation.objectName
    : `${confirmation?.objectName}.${confirmation?.attributeName}`);

  return (
    <div className="redos-confirm-backdrop" role="presentation">
      <section className="redos-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="redos-confirm-title">
        <div>
          <span className="redos-kicker">{kicker}</span>
          <h3 id="redos-confirm-title">{resolvedTitle}</h3>
          <p><strong>{resolvedTarget}</strong></p>
          <p>{children ?? 'Metadata ini akan dihapus dari draft aplikasi. Aksi ini tidak dijalankan sampai Anda klik Confirm Delete.'}</p>
        </div>
        <div className="redos-confirm-actions">
          <button type="button" onClick={onCancel}>Cancel</button>
          <button className={danger ? 'redos-danger-action' : 'redos-primary-action'} type="button" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </section>
    </div>
  );
}
