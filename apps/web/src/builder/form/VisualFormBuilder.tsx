import { useMemo, useState } from 'react';
import type { EntityDefinition, FieldDataType, FieldDefinition, FormDefinition, MetadataDefinition, MetadataDraft } from '@redios/shared';
import { Button, Input, Select } from '../../components/atomic/atoms/Atoms';
import type { DesignerClient, DesignerPreviewResult } from '../../core/api/designer-client';
import type { RuntimeForm, RuntimeFormField } from '../../core/renderer/runtime-types';
import type { RuntimeContext } from '../../core/renderer/runtime-types';
import { StudioBadge } from '../../studio/design-system/StudioDesignSystem';
import { EmptyState } from '../../studio/empty/EmptyState';
import { humanizeCode } from '../../studio/humanizer/HumanizerEngine';

type BuilderDevice = 'Desktop' | 'Tablet' | 'Mobile';
type BuilderMode = 'web' | 'android';
type BuilderTab = 'Fields' | 'Components';
type BuilderComponentType =
  | 'TEXT_INPUT'
  | 'TEXT_AREA'
  | 'NUMBER_INPUT'
  | 'DATE_PICKER'
  | 'SELECT'
  | 'CHECKBOX'
  | 'RADIO'
  | 'FILE_UPLOAD'
  | 'IMAGE_UPLOAD'
  | 'BUTTON'
  | 'SECTION'
  | 'TABS'
  | 'CONTAINER'
  | 'GRID'
  | 'TABLE'
  | 'CARD'
  | 'LOOKUP'
  | 'REPEATER'
  | 'SUB_FORM'
  | 'RECYCLER_VIEW'
  | 'BOTTOM_NAVIGATION'
  | 'CAMERA'
  | 'LOCATION'
  | 'BARCODE_SCANNER';
type BuilderActionType = 'Call Connection' | 'Save Record' | 'Update Record' | 'Delete Record' | 'Navigate Screen' | 'Run Automation' | 'Show Notification';

interface VisualComponent {
  id: string;
  type: BuilderComponentType;
  label: string;
  fieldCode?: string;
  sectionCode?: string;
  order?: number;
  x: number;
  y: number;
  width: number;
  height: number;
  placeholder?: string;
  required?: boolean;
  readonly?: boolean;
  visible?: boolean;
  binding?: {
    dataObject: string;
    informationField: string;
    path: string;
  };
  event?: {
    onClick: {
      type: BuilderActionType;
      method?: string;
      endpoint?: string;
      payload: Record<string, string>;
      successMessage?: string;
      navigateTo?: string;
    };
  };
}

const basicComponents: Array<{ type: BuilderComponentType; label: string }> = [
  { type: 'TEXT_INPUT', label: 'Text Input' },
  { type: 'NUMBER_INPUT', label: 'Number' },
  { type: 'DATE_PICKER', label: 'Date' },
  { type: 'SELECT', label: 'Dropdown' },
  { type: 'CHECKBOX', label: 'Checkbox' },
  { type: 'RADIO', label: 'Radio' },
  { type: 'FILE_UPLOAD', label: 'File Upload' },
  { type: 'IMAGE_UPLOAD', label: 'Image Upload' },
  { type: 'BUTTON', label: 'Button' },
];

const layoutComponents: Array<{ type: BuilderComponentType; label: string }> = [
  { type: 'SECTION', label: 'Section' },
  { type: 'TABS', label: 'Tabs' },
  { type: 'CONTAINER', label: 'Container' },
  { type: 'GRID', label: 'Grid' },
  { type: 'TABLE', label: 'Table' },
  { type: 'CARD', label: 'Card' },
];

const advancedComponents: Array<{ type: BuilderComponentType; label: string }> = [
  { type: 'LOOKUP', label: 'Relation Lookup' },
  { type: 'REPEATER', label: 'Repeater' },
  { type: 'SUB_FORM', label: 'Sub Form' },
];

const androidComponents: Array<{ type: BuilderComponentType; label: string }> = [
  { type: 'TEXT_INPUT', label: 'TextInput' },
  { type: 'RECYCLER_VIEW', label: 'RecyclerView / List' },
  { type: 'BOTTOM_NAVIGATION', label: 'Bottom Navigation' },
  { type: 'CARD', label: 'Card' },
  { type: 'CAMERA', label: 'Camera' },
  { type: 'IMAGE_UPLOAD', label: 'Image Upload' },
  { type: 'LOCATION', label: 'Location' },
  { type: 'BARCODE_SCANNER', label: 'Barcode Scanner' },
];

export function VisualFormBuilder({
  form,
  entity,
  designer,
  applicationName,
  developerMode = false,
  onPreview,
  onPublished,
  context,
  onBack,
  builderMode = 'web',
  eventCodes = [],
}: {
  form?: RuntimeForm;
  entity?: EntityDefinition;
  designer: DesignerClient;
  applicationName: string;
  developerMode?: boolean;
  context: RuntimeContext;
  onBack?: () => void;
  builderMode?: BuilderMode;
  eventCodes?: string[];
  onPreview: (preview: DesignerPreviewResult) => void;
  onPublished?: () => void;
}) {
  const [device, setDevice] = useState<BuilderDevice>(builderMode === 'android' ? 'Mobile' : 'Desktop');
  const [tab, setTab] = useState<BuilderTab>('Fields');
  const [draft, setDraft] = useState<MetadataDraft | undefined>();
  const [previewResult, setPreviewResult] = useState<DesignerPreviewResult | undefined>();
  const [selectedId, setSelectedId] = useState<string>('save-button');
  const [history, setHistory] = useState<string[]>([]);
  const [future, setFuture] = useState<string[]>([]);
  const [newFieldName, setNewFieldName] = useState('serial_number');
  const [newFieldType, setNewFieldType] = useState('Text');
  const [pendingComponent, setPendingComponent] = useState<BuilderComponentType | undefined>();
  const activeForm = draft ? formFromDraft(draft, form) : form;
  const components = useMemo(() => visualComponentsFromForm(activeForm, entity), [activeForm, entity]);
  const selected = components.find((component) => component.id === selectedId) ?? components[0];
  const eventOptions = eventCodes.length > 0 ? eventCodes : [`SAVE_${entity?.code ?? activeForm?.entityCode ?? 'OBJECT'}`];

  async function ensureDraft(): Promise<MetadataDraft | undefined> {
    if (draft || !activeForm) {
      return draft;
    }

    const nextDraft = await designer.createDraft({
      targetType: 'FORM',
      targetCode: activeForm.form,
      entityCode: activeForm.entityCode,
    });
    setDraft(nextDraft);
    return nextDraft;
  }

  async function addField(fieldCode: string, component = componentForField(fieldCode)) {
    const targetDraft = await ensureDraft();
    const section = activeForm?.sections[0];

    if (!targetDraft?.id || !activeForm || !section) {
      return;
    }

    remember(activeForm.form);
    let nextDraft = await designer.applyOperation(targetDraft.id, {
      type: 'ADD_FIELD',
      payload: {
        section: section.code,
        fieldCode,
        component,
        required: false,
        visible: true,
      },
    });
    const nextIndex = section.fields.length;
    nextDraft = await designer.applyOperation(nextDraft.id!, {
      type: 'CHANGE_PROPERTY',
      path: `layout.sections.0.fields.${nextIndex}.validation.visualBuilder`,
      after: visualMetadataFor(fieldCode, component, nextIndex, activeForm.entityCode),
    });
    setDraft(nextDraft);
    setSelectedId(fieldCode);
  }

  async function updateSelected(next: Partial<VisualComponent>) {
    if (!selected || selected.id === 'save-button') {
      setSelectedId('save-button');
      return;
    }

    const targetDraft = await ensureDraft();
    const location = fieldLocation(activeForm, selected.fieldCode);

    if (!targetDraft?.id || !location) {
      return;
    }

    remember(selected.id);
    const visual = { ...selected, ...next };
    let nextDraft = targetDraft;

    if (typeof next.label === 'string') {
      nextDraft = await designer.applyOperation(nextDraft.id!, {
        type: 'CHANGE_PROPERTY',
        path: `layout.sections.${location.sectionIndex}.fields.${location.fieldIndex}.validation.label`,
        after: next.label,
      });
    }

    if (typeof next.required === 'boolean') {
      nextDraft = await designer.applyOperation(nextDraft.id!, {
        type: 'CHANGE_PROPERTY',
        path: `layout.sections.${location.sectionIndex}.fields.${location.fieldIndex}.required`,
        after: next.required,
      });
    }

    if (typeof next.readonly === 'boolean') {
      nextDraft = await designer.applyOperation(nextDraft.id!, {
        type: 'CHANGE_PROPERTY',
        path: `layout.sections.${location.sectionIndex}.fields.${location.fieldIndex}.readonly`,
        after: next.readonly,
      });
    }

    if (typeof next.visible === 'boolean') {
      nextDraft = await designer.applyOperation(nextDraft.id!, {
        type: 'CHANGE_PROPERTY',
        path: `layout.sections.${location.sectionIndex}.fields.${location.fieldIndex}.visible`,
        after: next.visible,
      });
    }

    if (typeof next.order === 'number') {
      nextDraft = await designer.applyOperation(nextDraft.id!, {
        type: 'CHANGE_PROPERTY',
        path: `layout.sections.${location.sectionIndex}.fields.${location.fieldIndex}.order`,
        after: next.order,
      });
    }

    nextDraft = await designer.applyOperation(nextDraft.id!, {
      type: 'CHANGE_PROPERTY',
      path: `layout.sections.${location.sectionIndex}.fields.${location.fieldIndex}.validation.visualBuilder`,
      after: compactVisualMetadata(visual),
    });
    setDraft(nextDraft);
  }

  async function deleteSelected() {
    if (!selected?.fieldCode) {
      return;
    }

    const targetDraft = await ensureDraft();
    if (!targetDraft?.id) {
      return;
    }

    remember(selected.id);
    const nextDraft = await designer.applyOperation(targetDraft.id, {
      type: 'REMOVE_FIELD',
      payload: { fieldCode: selected.fieldCode },
    });
    setDraft(nextDraft);
    setSelectedId('save-button');
  }

  function duplicateSelected() {
    if (!selected) {
      return;
    }

    setPendingComponent(selected.type);
    setSelectedId('new-field');
    setNewFieldName(`${selected.fieldCode ?? labelForComponent(selected.type)}_copy`);
    setNewFieldType(fieldTypeForComponent(selected.type));
  }

  async function saveAction(next: VisualComponent['event']) {
    const targetDraft = await ensureDraft();
    const location = fieldLocation(activeForm, activeForm?.sections[0]?.fields[0]?.fieldCode);

    if (!targetDraft?.id || !location) {
      return;
    }

    const nextDraft = await designer.applyOperation(targetDraft.id, {
      type: 'CHANGE_PROPERTY',
      path: `layout.sections.${location.sectionIndex}.fields.${location.fieldIndex}.validation.visualBuilder.screenActions.saveButton`,
      after: next,
    });
    setDraft(nextDraft);
    setSelectedId('save-button');
  }

  async function createFieldAndAddToForm() {
    if (!activeForm || !entity || !newFieldName.trim()) {
      return;
    }

    const fieldCode = fieldCodeFromLabel(newFieldName);
    const component = pendingComponent ?? componentFromFieldType(newFieldType);
    const updatedEntity: EntityDefinition = {
      ...entity,
      fieldCodes: entity.fieldCodes.includes(fieldCode) ? entity.fieldCodes : [...entity.fieldCodes, fieldCode],
    };
    const nextField = formFieldFromComponent(fieldCode, component, activeForm.sections[0]?.fields.length ?? 0, activeForm.entityCode);
    const updatedForm = formDefinitionFromRuntime(activeForm, nextField);
    const fieldMetadata = metadata<FieldDefinition>('FIELD', fieldCode, humanizeCode(fieldCode), context, {
      code: fieldCode,
      name: humanizeCode(fieldCode),
      entityCode: entity.code,
      dataType: dataTypeFromFieldType(newFieldType),
      required: false,
      visible: true,
      readonly: false,
      validation: {
        visualBuilder: compactVisualMetadata(visualMetadataFor(fieldCode, component, activeForm.sections[0]?.fields.length ?? 0, activeForm.entityCode)),
      },
    });
    const entityMetadata = metadata<EntityDefinition>('ENTITY', entity.code, humanizeCode(entity.code), context, updatedEntity);
    const formMetadata = metadata<FormDefinition>('FORM', updatedForm.code, updatedForm.name, context, updatedForm);

    await designer.stageGenerated([entityMetadata, fieldMetadata, formMetadata]);
    setPendingComponent(undefined);
    setSelectedId(fieldCode);
    onPublished?.();
  }

  async function preview() {
    if (!draft?.id) {
      return;
    }

    const nextPreview = await designer.preview(draft.id);
    setPreviewResult(nextPreview);
    onPreview(nextPreview);
  }

  async function publish() {
    if (!draft?.id) {
      return;
    }

    const nextPreview = await designer.preview(draft.id);
    setPreviewResult(nextPreview);
    onPreview(nextPreview);

    if (nextPreview.valid) {
      await designer.publish(draft.id);
      setDraft(undefined);
      setPreviewResult(undefined);
      onPublished?.();
    }
  }

  function remember(token: string) {
    setHistory((current) => [token, ...current].slice(0, 20));
    setFuture([]);
  }

  if (!activeForm || !entity) {
    return <BuilderEmptyState builderMode={builderMode} applicationName={applicationName} onBack={onBack} />;
  }

  return (
    <main className="visual-builder-page">
      <header className="visual-builder-topbar">
        <Button variant="secondary" onClick={onBack ?? (() => { window.location.href = '/studio'; })}>Back</Button>
        <div>
          <span className="studio-kicker">{builderMode === 'android' ? 'Android Form Builder' : 'Web Form Builder'}</span>
          <h2>{humanizeCode(activeForm.form)}</h2>
          <p className="studio-muted">{applicationName}</p>
        </div>
        {builderMode === 'web' ? <div className="visual-builder-device-switch">
          {(['Desktop', 'Tablet', 'Mobile'] as BuilderDevice[]).map((nextDevice) => (
            <button key={nextDevice} className={device === nextDevice ? 'studio-chip studio-chip-active' : 'studio-chip'} type="button" onClick={() => setDevice(nextDevice)}>
              {nextDevice}
            </button>
          ))}
        </div> : <StudioBadge tone="info">Phone Preview</StudioBadge>}
        <div className="studio-action-row">
          <Button variant="secondary" disabled={history.length === 0} onClick={history.length ? () => setFuture((current) => [history[0], ...current]) : undefined}>Undo</Button>
          <Button variant="secondary" disabled={future.length === 0} onClick={future.length ? () => setFuture(([, ...rest]) => rest) : undefined}>Redo</Button>
          <Button variant="secondary" disabled={!draft} onClick={() => void preview()}>Preview</Button>
          <Button variant="secondary" disabled={!draft} onClick={() => void preview()}>Save</Button>
          <Button disabled={!draft} onClick={() => void publish()}>Publish</Button>
        </div>
      </header>

      <section className="visual-builder-workspace">
        <aside className="visual-builder-left">
          <div className="visual-builder-tabs">
            {(['Fields', 'Components'] as BuilderTab[]).map((nextTab) => (
              <button key={nextTab} className={tab === nextTab ? 'studio-chip studio-chip-active' : 'studio-chip'} type="button" onClick={() => setTab(nextTab)}>
                {nextTab === 'Fields' ? 'Fields' : nextTab}
              </button>
            ))}
          </div>
          {tab === 'Fields' ? (
            <FieldsPanel entity={entity} form={activeForm} onDropField={(fieldCode) => void addField(fieldCode)} />
          ) : (
            <ComponentsPanel builderMode={builderMode} onAddComponent={(component) => {
              if (component === 'BUTTON') {
                setSelectedId('save-button');
                setPendingComponent(undefined);
                return;
              }
              setPendingComponent(component);
              setSelectedId('new-field');
              setNewFieldName(labelForComponent(component));
              setNewFieldType(fieldTypeForComponent(component));
            }} />
          )}
        </aside>

        <section className={`visual-builder-canvas visual-builder-canvas-${device.toLowerCase()}`}>
          <div className="visual-builder-canvas-header">
            <h2>{humanizeCode(activeForm.form)}</h2>
            <StudioBadge tone={previewResult?.valid ? 'success' : draft ? 'warning' : 'info'}>{previewResult?.valid ? 'Preview valid' : draft ? 'Unsaved changes' : 'Synced'}</StudioBadge>
          </div>
          <div
            className="visual-builder-drop-area"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const fieldCode = event.dataTransfer.getData('application/redios-field');
              const component = event.dataTransfer.getData('application/redios-component') as BuilderComponentType;

              if (fieldCode) {
                void addField(fieldCode);
              } else if (component) {
                setPendingComponent(component);
                setSelectedId('new-field');
                setNewFieldName(labelForComponent(component));
                setNewFieldType(fieldTypeForComponent(component));
              }
            }}
          >
            {groupBySection(components).map(([sectionCode, sectionComponents]) => (
              <section key={sectionCode} className="visual-builder-section">
                <h3>{humanizeCode(sectionCode)}</h3>
                <div className="visual-builder-grid">
                  {sectionComponents.map((component) => (
                    <VisualComponentCard
                      key={component.id}
                      component={component}
                      selected={selected?.id === component.id}
                      developerMode={developerMode}
                      onSelect={() => {
                        setPendingComponent(undefined);
                        setSelectedId(component.id);
                      }}
                    />
                  ))}
                </div>
              </section>
            ))}
            <button className={selectedId === 'save-button' ? 'visual-component-card visual-component-selected' : 'visual-component-card'} type="button" onClick={() => setSelectedId('save-button')}>
              <strong>Save {humanizeCode(entity.code)}</strong>
              <span className="studio-muted">Button with On Click event</span>
            </button>
          </div>
        </section>

        <aside className="visual-builder-right">
          <PropertyInspector
            selected={selectedId === 'save-button' ? undefined : selected}
            entity={entity}
            eventOptions={eventOptions}
            builderMode={builderMode}
            developerMode={developerMode}
            newFieldName={newFieldName}
            newFieldType={newFieldType}
            pendingComponent={pendingComponent}
            onNewFieldName={setNewFieldName}
            onNewFieldType={setNewFieldType}
            onCreateField={() => void createFieldAndAddToForm()}
            onChange={(next) => void updateSelected(next)}
            onDelete={() => void deleteSelected()}
            onDuplicate={duplicateSelected}
            onSaveAction={saveAction}
          />
        </aside>
      </section>
    </main>
  );
}

function FieldsPanel({ entity, form, onDropField }: { entity: EntityDefinition; form: RuntimeForm; onDropField: (fieldCode: string) => void }) {
  const used = new Set(form.sections.flatMap((section) => section.fields.map((field) => field.fieldCode)));

  return (
    <div className="visual-builder-panel-body">
      <h3>{humanizeCode(entity.code)}</h3>
      {entity.fieldCodes.map((fieldCode) => (
        <button
          key={fieldCode}
          className="visual-builder-palette-item"
          draggable
          onDragStart={(event) => event.dataTransfer.setData('application/redios-field', fieldCode)}
          onClick={() => onDropField(fieldCode)}
        >
          <span>{used.has(fieldCode) ? '✓' : '+'}</span>
          <strong>{humanizeCode(fieldCode)}</strong>
          <small>{entity.code.toLowerCase()}.{fieldCode}</small>
        </button>
      ))}
    </div>
  );
}

function ComponentsPanel({ builderMode, onAddComponent }: { builderMode: BuilderMode; onAddComponent: (component: BuilderComponentType) => void }) {
  if (builderMode === 'android') {
    return (
      <div className="visual-builder-panel-body">
        <PaletteGroup title="Android Components" components={androidComponents} onAddComponent={onAddComponent} />
      </div>
    );
  }

  return (
    <div className="visual-builder-panel-body">
      <PaletteGroup title="Basic" components={basicComponents} onAddComponent={onAddComponent} />
      <PaletteGroup title="Layout" components={layoutComponents} onAddComponent={onAddComponent} />
      <PaletteGroup title="Advanced" components={advancedComponents} onAddComponent={onAddComponent} />
    </div>
  );
}

function PaletteGroup({ title, components, onAddComponent }: { title: string; components: Array<{ type: BuilderComponentType; label: string }>; onAddComponent: (component: BuilderComponentType) => void }) {
  return (
    <section>
      <h4>{title}</h4>
      {components.map((component) => (
        <button
          key={component.type}
          className="visual-builder-palette-item"
          draggable
          onDragStart={(event) => event.dataTransfer.setData('application/redios-component', component.type)}
          onClick={() => onAddComponent(component.type)}
        >
          <span>+</span>
          <strong>{component.label}</strong>
        </button>
      ))}
    </section>
  );
}

function VisualComponentCard({ component, selected, developerMode, onSelect }: { component: VisualComponent; selected: boolean; developerMode: boolean; onSelect: () => void }) {
  return (
    <button className={selected ? 'visual-component-card visual-component-selected' : 'visual-component-card'} style={{ gridColumn: `span ${component.width}` }} type="button" onClick={onSelect}>
      <label>
        <span>{component.label}</span>
        {renderComponentPreview(component)}
      </label>
      <small>{component.binding?.path}</small>
      {developerMode ? <code>{JSON.stringify(compactVisualMetadata(component))}</code> : null}
    </button>
  );
}

function PropertyInspector({
  selected,
  entity,
  eventOptions,
  builderMode,
  developerMode,
  newFieldName,
  newFieldType,
  pendingComponent,
  onNewFieldName,
  onNewFieldType,
  onCreateField,
  onChange,
  onDelete,
  onDuplicate,
  onSaveAction,
}: {
  selected?: VisualComponent;
  entity: EntityDefinition;
  eventOptions: string[];
  builderMode: BuilderMode;
  developerMode: boolean;
  newFieldName: string;
  newFieldType: string;
  pendingComponent?: BuilderComponentType;
  onNewFieldName: (value: string) => void;
  onNewFieldType: (value: string) => void;
  onCreateField: () => void;
  onChange: (next: Partial<VisualComponent>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onSaveAction: (event: VisualComponent['event']) => void;
}) {
  const [eventCode, setEventCode] = useState(eventOptions[0] ?? `SAVE_${entity.code}`);
  const [keyboardType, setKeyboardType] = useState('Default');
  const [offlineMode, setOfflineMode] = useState('Online first');
  const [syncBehavior, setSyncBehavior] = useState('Sync on save');

  if (!selected && pendingComponent) {
    return (
      <div className="visual-builder-inspector">
        <span className="studio-kicker">Create New Information Field</span>
        <h3>{humanizeCode(pendingComponent)}</h3>
        <p className="studio-muted">This records the builder intent. The next generated metadata publish can create Data Object, Information Field, Screen, and binding together.</p>
        <label className="studio-form-field">
          Information Field Name
          <Input value={newFieldName} onChange={onNewFieldName} />
        </label>
        <label className="studio-form-field">
          Type
          <Select value={newFieldType} options={['Text', 'Number', 'Date', 'Dropdown', 'File']} onChange={onNewFieldType} />
        </label>
        <div className="studio-list-row">
          <span>Data Object</span>
          <strong>{humanizeCode(entity.code)}</strong>
        </div>
        <div className="studio-inline-warning">Field metadata creation from this panel is staged for generated publish, so existing form metadata stays valid.</div>
        <Button onClick={onCreateField}>Create Field and Add to Form</Button>
      </div>
    );
  }

  if (!selected) {
    return (
      <div className="visual-builder-inspector">
        <span className="studio-kicker">Events</span>
        <h3>Save Button</h3>
        <h4>Event</h4>
        <p className="studio-muted">Layout builders only connect to existing Event Metadata. API URLs and business logic are managed in Metadata Designer.</p>
        <Select value={eventCode} options={eventOptions} onChange={setEventCode} />
        <Button onClick={() => onSaveAction({
          onClick: {
            type: 'Run Automation',
            payload: {
              event: eventCode,
            },
          },
        })}>Save Event</Button>
        {developerMode ? <pre>{JSON.stringify({ event: 'button.click', target: 'saveButton', eventCode }, null, 2)}</pre> : null}
      </div>
    );
  }

  return (
    <div className="visual-builder-inspector">
      <span className="studio-kicker">Property Inspector</span>
      <h3>{selected.label}</h3>
      <h4>General</h4>
      <label className="studio-form-field">
        Label
        <Input value={selected.label} onChange={(label) => onChange({ label })} />
      </label>
      <label className="studio-form-field">
        Field
        <Input value={selected.fieldCode ?? ''} onChange={() => undefined} />
      </label>
      <label className="studio-form-field">
        Placeholder
        <Input value={selected.placeholder ?? ''} onChange={(placeholder) => onChange({ placeholder })} />
      </label>
      <h4>Input</h4>
      <label className="studio-form-field">
        Type
        <Select value={selected.type} options={basicComponents.map((component) => component.type)} onChange={(value) => onChange({ type: value as BuilderComponentType })} />
      </label>
      <label className="studio-check-row">
        <input type="checkbox" checked={Boolean(selected.required)} onChange={(event) => onChange({ required: event.target.checked })} />
        Required
      </label>
      <label className="studio-check-row">
        <input type="checkbox" checked={Boolean(selected.readonly)} onChange={(event) => onChange({ readonly: event.target.checked })} />
        Readonly
      </label>
      <label className="studio-check-row">
        <input type="checkbox" checked={selected.visible !== false} onChange={(event) => onChange({ visible: event.target.checked })} />
        Visible
      </label>
      <h4>Layout</h4>
      <label className="studio-form-field">
        Width
        <Select value={`${selected.width}`} options={['12', '6', '4']} onChange={(value) => onChange({ width: Number(value) })} />
      </label>
      <label className="studio-form-field">
        Column
        <Select value={`${Math.floor((selected.x ?? 0) / 4) + 1}`} options={['1', '2', '3']} onChange={(value) => onChange({ x: (Number(value) - 1) * 4 })} />
      </label>
      <label className="studio-form-field">
        Order
        <Input value={`${selected.order ?? selected.y ?? 0}`} onChange={(value) => onChange({ order: Number(value), y: Number(value) })} />
      </label>
      <h4>Validation</h4>
      <label className="studio-form-field">
        Min
        <Input value="" onChange={() => undefined} />
      </label>
      <label className="studio-form-field">
        Max
        <Input value="" onChange={() => undefined} />
      </label>
      <label className="studio-form-field">
        Regex
        <Input value="" onChange={() => undefined} />
      </label>
      <h4>Data Binding</h4>
      <div className="studio-list-row">
        <span>Data Object</span>
        <strong>{humanizeCode(entity.code)}</strong>
      </div>
      <div className="studio-list-row">
        <span>Binding</span>
        <strong>{selected.fieldCode}</strong>
      </div>
      <p className="studio-muted">Binding is automatic from metadata. API and events are defined in Metadata Designer.</p>
      {builderMode === 'android' ? (
        <>
          <h4>Mobile Properties</h4>
          <label className="studio-form-field">
            Keyboard Type
            <Select value={keyboardType} options={['Default', 'Text', 'Number', 'Phone', 'Email']} onChange={setKeyboardType} />
          </label>
          <label className="studio-form-field">
            Offline Mode
            <Select value={offlineMode} options={['Online first', 'Offline first', 'Read only offline']} onChange={setOfflineMode} />
          </label>
          <label className="studio-form-field">
            Sync Behavior
            <Select value={syncBehavior} options={['Sync on save', 'Background sync', 'Manual sync']} onChange={setSyncBehavior} />
          </label>
          <label className="studio-check-row">
            <input type="checkbox" onChange={() => undefined} />
            Camera permission required
          </label>
        </>
      ) : null}
      <div className="studio-card">
        <strong>Component Actions</strong>
        <p className="studio-muted">Duplicate creates a new information field instead of reusing the same binding.</p>
        <div className="studio-action-row">
          <Button variant="secondary" onClick={onDuplicate}>Duplicate</Button>
          <Button variant="secondary" onClick={onDelete}>Delete</Button>
        </div>
      </div>
      <div className="studio-card">
        <strong>Add Field Here</strong>
        <p className="studio-muted">Create an information field without leaving the builder.</p>
        <Input value={newFieldName} onChange={onNewFieldName} />
        <Select value={newFieldType} options={['Text', 'Number', 'Date', 'Dropdown', 'File']} onChange={onNewFieldType} />
        <Button onClick={onCreateField}>Create Field and Add</Button>
      </div>
      {developerMode ? <pre>{JSON.stringify(compactVisualMetadata(selected), null, 2)}</pre> : null}
    </div>
  );
}

function BuilderEmptyState({
  builderMode,
  applicationName,
  onBack,
}: {
  builderMode: BuilderMode;
  applicationName: string;
  onBack?: () => void;
}) {
  const components = builderMode === 'android'
    ? androidComponents
    : [
        ...basicComponents,
        { type: 'TEXT_AREA' as BuilderComponentType, label: 'Text Area' },
        ...layoutComponents,
        ...advancedComponents,
      ];

  return (
    <main className="visual-builder-page">
      <header className="visual-builder-topbar">
        <Button variant="secondary" onClick={onBack ?? (() => { window.location.href = '/studio'; })}>Back to Studio</Button>
        <div>
          <span className="studio-kicker">{builderMode === 'android' ? 'Android Builder' : 'Web App Builder'}</span>
          <h2>{applicationName}</h2>
          <p className="studio-muted">No form metadata is available for this route yet.</p>
        </div>
        <StudioBadge tone="warning">Missing Form Metadata</StudioBadge>
        <div className="studio-action-row">
          <Button variant="secondary" onClick={() => { window.location.href = '/studio/metadata'; }}>Metadata Designer</Button>
          <Button onClick={() => { window.location.href = '/studio/create'; }}>Create Object</Button>
        </div>
      </header>

      <section className="visual-builder-workspace">
        <aside className="visual-builder-left">
          <div className="visual-builder-panel-body">
            <span className="studio-kicker">Main Modules</span>
            <button className="visual-builder-palette-item" type="button" onClick={() => { window.location.href = '/studio/metadata'; }}>
              <span>DB</span>
              <strong>Metadata Designer</strong>
              <small>Define Object, Attribute, API, and Event first.</small>
            </button>
            <button className="visual-builder-palette-item" type="button" onClick={() => { window.location.href = '/studio/builder/web/WEB_APP_BUILDER'; }}>
              <span>WEB</span>
              <strong>Web App Builder</strong>
              <small>Design web layout after form metadata exists.</small>
            </button>
            <button className="visual-builder-palette-item" type="button" onClick={() => { window.location.href = '/studio/builder/android/ANDROID_BUILDER'; }}>
              <span>DROID</span>
              <strong>Android Builder</strong>
              <small>Design mobile layout after form metadata exists.</small>
            </button>
          </div>
          <div className="visual-builder-panel-body">
            <span className="studio-kicker">Component Toolbox</span>
            <p className="studio-muted">These are the tools available once metadata is connected.</p>
            {components.map((component) => (
              <button
                key={`${component.type}:${component.label}`}
                className="visual-builder-palette-item"
                type="button"
                onClick={() => { window.location.href = '/studio/metadata'; }}
              >
                <span>+</span>
                <strong>{component.label}</strong>
                <small>{componentHint(component.type)}</small>
              </button>
            ))}
          </div>
        </aside>

        <section className="visual-builder-canvas">
          <div className="visual-builder-canvas-header">
            <h2>{builderMode === 'android' ? 'Android Canvas' : 'Web Canvas'}</h2>
            <StudioBadge tone="info">Layout only</StudioBadge>
          </div>
          <EmptyState
            title="No form metadata found"
            description="Create or select an Object in Metadata Designer first. Then this toolbox can place fields, inputs, dropdowns, text areas, buttons, tables, cards, and sections into the canvas."
            primaryAction={<Button onClick={() => { window.location.href = '/studio/metadata'; }}>Open Metadata Designer</Button>}
            secondaryAction={<Button variant="secondary" onClick={() => { window.location.href = '/studio/create'; }}>Create Starter App</Button>}
          />
        </section>

        <aside className="visual-builder-right">
          <div className="visual-builder-inspector">
            <span className="studio-kicker">Properties</span>
            <h3>Toolbox Ready</h3>
            <p className="studio-muted">
              Select or create form metadata first. After that, selecting a component here will show Label, Width, Visible, Required, Data Binding, and Event settings.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}

function componentHint(type: BuilderComponentType): string {
  if (type === 'BUTTON') {
    return 'Connect to Event Metadata';
  }

  if (type === 'SELECT' || type === 'LOOKUP') {
    return 'Uses Data Source Metadata';
  }

  if (type === 'TABLE' || type === 'RECYCLER_VIEW') {
    return 'List layout component';
  }

  if (type === 'CAMERA' || type === 'IMAGE_UPLOAD' || type === 'LOCATION' || type === 'BARCODE_SCANNER') {
    return 'Android capability component';
  }

  return 'Visual layout component';
}

function renderComponentPreview(component: VisualComponent) {
  if (component.type === 'BUTTON') {
    return <button type="button">{component.label}</button>;
  }

  if (component.type === 'SELECT' || component.type === 'LOOKUP') {
    return <select disabled><option>{component.placeholder ?? `Choose ${component.label}`}</option></select>;
  }

  if (component.type === 'FILE_UPLOAD' || component.type === 'IMAGE_UPLOAD') {
    return <input readOnly placeholder="Upload file" />;
  }

  if (component.type === 'TEXT_AREA') {
    return <textarea readOnly placeholder={component.placeholder ?? component.label} />;
  }

  return <input readOnly placeholder={component.placeholder ?? component.label} />;
}

function visualComponentsFromForm(form?: RuntimeForm, entity?: EntityDefinition): VisualComponent[] {
  if (!form) {
    return [];
  }

  return form.sections.flatMap((section, sectionIndex) =>
    section.fields.map((field, fieldIndex) => {
      const visual = visualMetadata(field);
      const fieldValidation = validationFor(field);
      const label = String(fieldValidation.label ?? humanizeCode(field.fieldCode));

      return {
        id: field.fieldCode,
        type: field.component as BuilderComponentType,
        label,
        fieldCode: field.fieldCode,
        sectionCode: section.code,
        x: visual.x ?? (fieldIndex % 2) * 6,
        y: visual.y ?? sectionIndex * 4 + Math.floor(fieldIndex / 2),
        width: visual.width ?? 6,
        height: visual.height ?? 1,
        placeholder: visual.placeholder ?? label,
        required: field.required,
        readonly: field.readonly,
        visible: field.visible,
        binding: {
          dataObject: form.entityCode,
          informationField: field.fieldCode,
          path: `${(entity?.code ?? form.entityCode).toLowerCase()}.${field.fieldCode}`,
        },
      } satisfies VisualComponent;
    }),
  );
}

function visualMetadata(field: RuntimeFormField): Partial<VisualComponent> {
  const value = validationFor(field).visualBuilder;
  return value && typeof value === 'object' ? value as Partial<VisualComponent> : {};
}

function validationFor(field: RuntimeFormField): Record<string, unknown> {
  return (field as RuntimeFormField & { validation?: Record<string, unknown> }).validation ?? {};
}

function visualMetadataFor(fieldCode: string, component: string, index: number, entityCode: string): Partial<VisualComponent> {
  return {
    type: component as BuilderComponentType,
    label: humanizeCode(fieldCode),
    fieldCode,
    order: index + 1,
    x: (index % 2) * 6,
    y: Math.floor(index / 2),
    width: 6,
    height: 1,
    binding: {
      dataObject: entityCode,
      informationField: fieldCode,
      path: `${entityCode.toLowerCase()}.${fieldCode}`,
    },
  };
}

function compactVisualMetadata(component: Partial<VisualComponent>): Partial<VisualComponent> {
  return {
    type: component.type,
    label: component.label,
    fieldCode: component.fieldCode,
    order: component.order,
    x: component.x,
    y: component.y,
    width: component.width,
    height: component.height,
    placeholder: component.placeholder,
    required: component.required,
    readonly: component.readonly,
    visible: component.visible,
    binding: component.binding,
    event: component.event,
  };
}

function formFromDraft(draft: MetadataDraft, fallback?: RuntimeForm): RuntimeForm | undefined {
  const definition = draft.draft.definition as FormDefinition | undefined;

  if (!definition?.layout || !fallback) {
    return fallback;
  }

  return {
    ...fallback,
    form: definition.code,
    entityCode: definition.entityCode,
    name: definition.name,
    version: definition.version,
    layout: definition.layout.type,
    sections: definition.layout.sections.map((section) => ({
      code: section.code,
      fields: section.fields.map((field) => ({
        fieldCode: field.fieldCode,
        component: field.component,
        order: field.order,
        required: field.required,
        readonly: field.readonly ?? false,
        visible: field.visible ?? true,
        validation: field.validation,
        binding: field.binding ? { ...field.binding, path: field.fieldCode } : undefined,
        relation: field.lookup ? { code: field.lookup.relationCode, target: '', valueField: '' } : undefined,
        view: field.lookup ? { code: field.lookup.viewCode, entityCode: '', type: '', columns: [] } : undefined,
      })),
    })),
  };
}

function metadata<TDefinition>(
  type: MetadataDefinition<TDefinition>['type'],
  code: string,
  name: string,
  context: RuntimeContext,
  definition: TDefinition,
): MetadataDefinition<TDefinition> {
  return {
    tenantId: context.tenantId,
    domainCode: context.domainCode,
    applicationCode: context.applicationCode,
    type,
    code,
    name,
    version: 1,
    enabled: true,
    definition,
  };
}

function formFieldFromComponent(
  fieldCode: string,
  component: BuilderComponentType,
  index: number,
  entityCode: string,
): FormDefinition['layout']['sections'][number]['fields'][number] {
  return {
    fieldCode,
    component,
    order: index + 1,
    required: false,
    readonly: false,
    visible: true,
    binding: {
      source: 'FORM',
      fieldCode,
    },
    validation: {
      label: humanizeCode(fieldCode),
      visualBuilder: visualMetadataFor(fieldCode, component, index, entityCode),
    },
  };
}

function formDefinitionFromRuntime(form: RuntimeForm, nextField: FormDefinition['layout']['sections'][number]['fields'][number]): FormDefinition {
  const sections = form.sections.length > 0 ? form.sections : [{ code: 'MAIN', fields: [] }];

  return {
    code: form.form,
    entityCode: form.entityCode,
    name: form.name,
    version: form.version,
    enabled: true,
    layout: {
      type: form.layout === 'TWO_COLUMN' ? 'TWO_COLUMN' : 'SECTION',
      sections: sections.map((section, sectionIndex) => ({
        code: section.code,
        title: humanizeCode(section.code),
        order: sectionIndex + 1,
        fields: [
          ...section.fields.map((field) => ({
            fieldCode: field.fieldCode,
            component: field.component,
            order: field.order,
            required: field.required,
            readonly: field.readonly ?? false,
            visible: field.visible ?? true,
            binding: {
              source: 'FORM' as const,
              fieldCode: field.fieldCode,
            },
            validation: validationFor(field),
          })),
          ...(sectionIndex === 0 && !section.fields.some((field) => field.fieldCode === nextField.fieldCode) ? [nextField] : []),
        ],
      })),
    },
  };
}

function fieldCodeFromLabel(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'new_field';
}

function componentFromFieldType(type: string): BuilderComponentType {
  if (type === 'Number') {
    return 'NUMBER_INPUT';
  }

  if (type === 'Date') {
    return 'DATE_PICKER';
  }

  if (type === 'Dropdown') {
    return 'SELECT';
  }

  if (type === 'File') {
    return 'FILE_UPLOAD';
  }

  return 'TEXT_INPUT';
}

function dataTypeFromFieldType(type: string): FieldDataType {
  if (type === 'Number') {
    return 'number';
  }

  if (type === 'Date') {
    return 'date';
  }

  if (type === 'File') {
    return 'object';
  }

  return 'string';
}

function groupBySection(components: VisualComponent[]): Array<[string, VisualComponent[]]> {
  const groups = new Map<string, VisualComponent[]>();

  for (const component of components) {
    const key = component.sectionCode ?? 'Screen';
    groups.set(key, [...(groups.get(key) ?? []), component]);
  }

  return [...groups.entries()];
}

function fieldLocation(form: RuntimeForm | undefined, fieldCode?: string): { sectionIndex: number; fieldIndex: number } | undefined {
  if (!form || !fieldCode) {
    return undefined;
  }

  for (const [sectionIndex, section] of form.sections.entries()) {
    const fieldIndex = section.fields.findIndex((field) => field.fieldCode === fieldCode);

    if (fieldIndex >= 0) {
      return { sectionIndex, fieldIndex };
    }
  }

  return undefined;
}

function componentForField(fieldCode: string): BuilderComponentType {
  if (/price|stock|qty|amount|total|number/i.test(fieldCode)) {
    return 'NUMBER_INPUT';
  }

  if (/date|time/i.test(fieldCode)) {
    return 'DATE_PICKER';
  }

  if (/status|category|type/i.test(fieldCode)) {
    return 'SELECT';
  }

  return 'TEXT_INPUT';
}

function labelForComponent(component: BuilderComponentType): string {
  return component.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'component';
}

function fieldTypeForComponent(component: BuilderComponentType): string {
  if (component === 'NUMBER_INPUT') {
    return 'Number';
  }

  if (component === 'DATE_PICKER') {
    return 'Date';
  }

  if (component === 'SELECT' || component === 'RADIO' || component === 'CHECKBOX') {
    return 'Dropdown';
  }

  if (component === 'FILE_UPLOAD' || component === 'IMAGE_UPLOAD') {
    return 'File';
  }

  return 'Text';
}
