import { useMemo, useState } from 'react';
import type { EntityDefinition, FormDefinition, MetadataDraft } from '@redios/shared';
import { Button, Input, Select } from '../../components/atomic/atoms/Atoms';
import type { DesignerClient, DesignerPreviewResult } from '../../core/api/designer-client';
import type { RuntimeForm, RuntimeFormField } from '../../core/renderer/runtime-types';
import { StudioBadge } from '../../studio/design-system/StudioDesignSystem';
import { EmptyState } from '../../studio/empty/EmptyState';
import { humanizeCode } from '../../studio/humanizer/HumanizerEngine';

type BuilderDevice = 'Desktop' | 'Tablet' | 'Mobile';
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
  | 'SUB_FORM';
type BuilderActionType = 'Call Connection' | 'Save Record' | 'Update Record' | 'Delete Record' | 'Navigate Screen' | 'Run Automation' | 'Show Notification';

interface VisualComponent {
  id: string;
  type: BuilderComponentType;
  label: string;
  fieldCode?: string;
  sectionCode?: string;
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

export function VisualFormBuilder({
  form,
  entity,
  designer,
  applicationName,
  developerMode = false,
  onPreview,
  onPublished,
}: {
  form?: RuntimeForm;
  entity?: EntityDefinition;
  designer: DesignerClient;
  applicationName: string;
  developerMode?: boolean;
  onPreview: (preview: DesignerPreviewResult) => void;
  onPublished?: () => void;
}) {
  const [device, setDevice] = useState<BuilderDevice>('Desktop');
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
  const defaultConnections = entity ? [
    { method: 'GET', endpoint: `/${entity.code.toLowerCase()}` },
    { method: 'POST', endpoint: `/${entity.code.toLowerCase()}` },
    { method: 'PUT', endpoint: `/${entity.code.toLowerCase()}/{id}` },
    { method: 'DELETE', endpoint: `/${entity.code.toLowerCase()}/{id}` },
  ] : [];

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

    nextDraft = await designer.applyOperation(nextDraft.id!, {
      type: 'CHANGE_PROPERTY',
      path: `layout.sections.${location.sectionIndex}.fields.${location.fieldIndex}.validation.visualBuilder`,
      after: compactVisualMetadata(visual),
    });
    setDraft(nextDraft);
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
    return <BuilderEmptyState />;
  }

  return (
    <main className="visual-builder-page">
      <header className="visual-builder-topbar">
        <div>
          <span className="studio-kicker">Full Page Builder</span>
          <h2>{applicationName}</h2>
          <p className="studio-muted">{humanizeCode(activeForm.form)} untuk {humanizeCode(entity.code)}</p>
        </div>
        <div className="visual-builder-device-switch">
          {(['Desktop', 'Tablet', 'Mobile'] as BuilderDevice[]).map((nextDevice) => (
            <button key={nextDevice} className={device === nextDevice ? 'studio-chip studio-chip-active' : 'studio-chip'} type="button" onClick={() => setDevice(nextDevice)}>
              {nextDevice}
            </button>
          ))}
        </div>
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
                {nextTab === 'Fields' ? 'Information Fields' : 'Components'}
              </button>
            ))}
          </div>
          {tab === 'Fields' ? (
            <FieldsPanel entity={entity} form={activeForm} onDropField={(fieldCode) => void addField(fieldCode)} />
          ) : (
            <ComponentsPanel onAddComponent={(component) => {
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
            defaultConnections={defaultConnections}
            developerMode={developerMode}
            newFieldName={newFieldName}
            newFieldType={newFieldType}
            pendingComponent={pendingComponent}
            onNewFieldName={setNewFieldName}
            onNewFieldType={setNewFieldType}
            onChange={(next) => void updateSelected(next)}
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

function ComponentsPanel({ onAddComponent }: { onAddComponent: (component: BuilderComponentType) => void }) {
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
  defaultConnections,
  developerMode,
  newFieldName,
  newFieldType,
  pendingComponent,
  onNewFieldName,
  onNewFieldType,
  onChange,
  onSaveAction,
}: {
  selected?: VisualComponent;
  entity: EntityDefinition;
  defaultConnections: Array<{ method: string; endpoint: string }>;
  developerMode: boolean;
  newFieldName: string;
  newFieldType: string;
  pendingComponent?: BuilderComponentType;
  onNewFieldName: (value: string) => void;
  onNewFieldType: (value: string) => void;
  onChange: (next: Partial<VisualComponent>) => void;
  onSaveAction: (event: VisualComponent['event']) => void;
}) {
  const [actionType, setActionType] = useState<BuilderActionType>('Save Record');
  const [method, setMethod] = useState(defaultConnections[1]?.method ?? 'POST');
  const [endpoint, setEndpoint] = useState(defaultConnections[1]?.endpoint ?? `/${entity.code.toLowerCase()}`);
  const [toast, setToast] = useState(`${humanizeCode(entity.code)} saved`);
  const [navigateTo, setNavigateTo] = useState(`${humanizeCode(entity.code)} List`);

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
      </div>
    );
  }

  if (!selected) {
    return (
      <div className="visual-builder-inspector">
        <span className="studio-kicker">Events</span>
        <h3>Save Button</h3>
        <h4>On Click</h4>
        <Select value={actionType} options={['Call Connection', 'Save Record', 'Update Record', 'Delete Record', 'Navigate Screen', 'Run Automation', 'Show Notification']} onChange={(value) => setActionType(value as BuilderActionType)} />
        <label className="studio-form-field">
          Connection Method
          <Select value={method} options={['GET', 'POST', 'PUT', 'DELETE']} onChange={setMethod} />
        </label>
        <label className="studio-form-field">
          Endpoint
          <Input value={endpoint} onChange={setEndpoint} />
        </label>
        <h4>Payload Mapper</h4>
        {entity.fieldCodes.slice(0, 6).map((fieldCode) => (
          <div key={fieldCode} className="studio-list-row">
            <span>{fieldCode}</span>
            <strong>{entity.code.toLowerCase()}.{fieldCode}</strong>
          </div>
        ))}
        <label className="studio-form-field">
          Success Toast
          <Input value={toast} onChange={setToast} />
        </label>
        <label className="studio-form-field">
          Navigate
          <Input value={navigateTo} onChange={setNavigateTo} />
        </label>
        <Button onClick={() => onSaveAction({
          onClick: {
            type: actionType,
            method,
            endpoint,
            payload: Object.fromEntries(entity.fieldCodes.map((fieldCode) => [fieldCode, `${entity.code.toLowerCase()}.${fieldCode}`])),
            successMessage: toast,
            navigateTo,
          },
        })}>Save Event</Button>
        {developerMode ? <pre>{JSON.stringify({ actionType, method, endpoint }, null, 2)}</pre> : null}
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
      <h4>Binding</h4>
      <div className="studio-list-row">
        <span>Data Object</span>
        <strong>{humanizeCode(entity.code)}</strong>
      </div>
      <div className="studio-list-row">
        <span>Information Field</span>
        <strong>{selected.fieldCode}</strong>
      </div>
      <h4>UI</h4>
      <label className="studio-form-field">
        Width
        <Select value={`${selected.width}`} options={['3', '4', '6', '8', '12']} onChange={(value) => onChange({ width: Number(value) })} />
      </label>
      <label className="studio-form-field">
        Height
        <Select value={`${selected.height}`} options={['1', '2', '3', '4']} onChange={(value) => onChange({ height: Number(value) })} />
      </label>
      <label className="studio-form-field">
        Placeholder
        <Input value={selected.placeholder ?? ''} onChange={(placeholder) => onChange({ placeholder })} />
      </label>
      <label className="studio-check-row">
        <input type="checkbox" checked={selected.visible !== false} onChange={(event) => onChange({ visible: event.target.checked })} />
        Visible
      </label>
      <label className="studio-check-row">
        <input type="checkbox" checked={Boolean(selected.readonly)} onChange={(event) => onChange({ readonly: event.target.checked })} />
        Readonly
      </label>
      <h4>Validation</h4>
      <label className="studio-check-row">
        <input type="checkbox" checked={Boolean(selected.required)} onChange={(event) => onChange({ required: event.target.checked })} />
        Required
      </label>
      <div className="studio-card">
        <strong>Create New Information Field</strong>
        <p className="studio-muted">Intent metadata for adding new data from inside builder.</p>
        <Input value={newFieldName} onChange={onNewFieldName} />
        <Select value={newFieldType} options={['Text', 'Number', 'Date', 'Dropdown', 'File']} onChange={onNewFieldType} />
      </div>
      {developerMode ? <pre>{JSON.stringify(compactVisualMetadata(selected), null, 2)}</pre> : null}
    </div>
  );
}

function BuilderEmptyState() {
  return (
    <main className="visual-builder-page">
      <EmptyState
        title="What do you want to build?"
        description="Choose a starter to create data, screens, connections, and navigation, then open the full visual builder."
        primaryAction={<Button onClick={() => { window.location.href = '/studio/create'; }}>Inventory App</Button>}
      />
      <div className="studio-card-grid">
        {['Inventory App', 'CRM', 'Asset Management'].map((label) => (
          <article key={label} className="studio-card">
            <h3>{label}</h3>
            <p className="studio-muted">Auto create starter metadata, API connections, navigation, and screen.</p>
          </article>
        ))}
      </div>
    </main>
  );
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
