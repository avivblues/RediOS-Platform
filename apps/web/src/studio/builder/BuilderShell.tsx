import { useMemo, useState } from 'react';
import { Canvas } from './Canvas/Canvas';
import { ComponentPanel } from './ComponentPanel/ComponentPanel';
import { PropertyPanel } from './PropertyPanel/PropertyPanel';
import { TreePanel } from './TreePanel/TreePanel';
import { findCustomOrganism, loadDataObjects } from '../metadata/metadata-store';
import { AdminGuidePanel } from '../guide/AdminGuide';
import type {
  BuilderComponentDefinition,
  BuilderDataObject,
  CanvasComponent,
  ComponentMoveDirection,
  ComponentResizeDirection,
  StudioDevice,
  StudioTarget,
} from './types';

interface BuilderDraftState {
  components: CanvasComponent[];
  device: StudioDevice;
  selectedId: string;
  savedAt: string;
  theme?: BuilderTheme;
}

type BuilderTheme = 'Light' | 'Mint' | 'Dark';

const ACTIVE_APP_KEY_PREFIX = 'redios:studio:active-app';
const GRID_COLUMNS = 12;
const MIN_COMPONENT_WIDTH = 2;
const MIN_COMPONENT_HEIGHT = 48;
const MAX_COMPONENT_HEIGHT = 420;

const initialComponents: CanvasComponent[] = [
  {
    id: 'product_name',
    type: 'TextInput',
    label: 'Product Name',
    placeholder: 'Enter product name',
    width: 12,
    height: 86,
    x: 0,
    y: 0,
    binding: { object: 'Product', field: 'name' },
  },
  {
    id: 'stock',
    type: 'NumberInput',
    label: 'Stock',
    placeholder: 'Enter stock',
    width: 12,
    height: 86,
    x: 0,
    y: 1,
    binding: { object: 'Product', field: 'stock' },
  },
  {
    id: 'save_product',
    type: 'Button',
    label: 'Save Product',
    width: 12,
    height: 72,
    x: 0,
    y: 2,
    events: { onClick: 'Save Product Action' },
  },
];

const builderTemplates: Array<{ id: string; label: string; components: CanvasComponent[] }> = [
  {
    id: 'create_account',
    label: 'Create account',
    components: [
      {
        id: 'template_form',
        type: 'Form',
        label: 'Create account',
        width: 12,
        height: 420,
        x: 0,
        y: 0,
        children: [
          { id: 'first_name', type: 'TextInput', label: 'First name', placeholder: 'First name', width: 6, height: 76, x: 0, y: 0 },
          { id: 'last_name', type: 'TextInput', label: 'Last name', placeholder: 'Last name', width: 6, height: 76, x: 6, y: 1 },
          { id: 'birthday', type: 'DateInput', label: 'Birthday', width: 12, height: 76, x: 0, y: 2 },
          { id: 'country', type: 'Dropdown', label: 'Country', placeholder: 'Country', width: 12, height: 76, x: 0, y: 3 },
          { id: 'phone', type: 'PhoneInput', label: 'Phone', width: 12, height: 76, x: 0, y: 4 },
          { id: 'email', type: 'EmailInput', label: 'Email', width: 12, height: 76, x: 0, y: 5 },
          { id: 'password', type: 'PasswordInput', label: 'Password', width: 12, height: 76, x: 0, y: 6 },
          { id: 'terms', type: 'DecisionBox', label: 'I accept the Terms & Conditions', width: 12, height: 64, x: 0, y: 7 },
          { id: 'submit_account', type: 'Submit', label: 'Create account', width: 4, height: 64, x: 4, y: 8 },
        ],
      },
    ],
  },
  {
    id: 'survey_matrix',
    label: 'Survey form',
    components: [
      { id: 'survey_heading', type: 'FormHeading', label: 'Customer feedback', width: 12, height: 64, x: 0, y: 0 },
      { id: 'satisfaction', type: 'SingleChoiceMatrix', label: 'Satisfaction matrix', width: 12, height: 260, x: 0, y: 1 },
      { id: 'feedback_notes', type: 'TextEditor', label: 'Feedback notes', width: 12, height: 132, x: 0, y: 2 },
      { id: 'survey_submit', type: 'Submit', label: 'Submit survey', width: 4, height: 64, x: 4, y: 3 },
    ],
  },
  {
    id: 'asset_table',
    label: 'Asset table',
    components: [
      { id: 'asset_header', type: 'FormHeading', label: 'Asset management', width: 12, height: 64, x: 0, y: 0 },
      { id: 'asset_data_table', type: 'DataTable', label: 'Asset DataTable', width: 12, height: 260, x: 0, y: 1 },
      { id: 'asset_confirm', type: 'ConfirmModal', label: 'Confirm asset action', width: 8, height: 220, x: 2, y: 2 },
    ],
  },
];

export function BuilderShell({ target }: { target: StudioTarget }) {
  const dataObjects = useMemo<BuilderDataObject[]>(() => loadDataObjects().map((object) => ({
    name: object.name,
    fields: object.attributes.map((attribute) => attribute.name),
  })), []);
  const savedDraft = loadBuilderDraft(target);
  const [device, setDevice] = useState<StudioDevice>(savedDraft?.device ?? (target === 'android' ? 'Mobile' : 'Desktop'));
  const [tab, setTab] = useState<'Components' | 'Data'>('Components');
  const [components, setComponents] = useState(savedDraft?.components ?? initialComponents);
  const [selectedId, setSelectedId] = useState(savedDraft?.selectedId ?? 'product_name');
  const [statusMessage, setStatusMessage] = useState(savedDraft ? `Draft restored from ${formatSavedAt(savedDraft.savedAt)}` : 'Draft ready');
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isToolboxCollapsed, setIsToolboxCollapsed] = useState(false);
  const [theme, setTheme] = useState<BuilderTheme>(savedDraft?.theme ?? 'Light');
  const selected = findComponentById(components, selectedId);
  const metadataSummary = useMemo(() => {
    const allComponents = flattenComponents(components);
    const boundFields = allComponents.filter((component) => component.binding).length;
    const boundActions = allComponents.filter((component) => component.events && Object.values(component.events).some(Boolean)).length;

    return {
      components: allComponents.length,
      fields: boundFields,
      actions: boundActions,
    };
  }, [components]);

  function addComponent(definition: BuilderComponentDefinition, insertIndex = components.length, parentId?: string) {
    const customOrganism = findCustomOrganism(definition.type);
    const selectedParentId = selected?.type === 'Form' ? selected.id : findParentComponentId(components, selectedId);
    const targetParentId = parentId ?? selectedParentId;
    const next: CanvasComponent = {
      id: `${definition.type}_${Date.now()}`,
      type: definition.type,
      label: definition.label,
      width: defaultComponentWidth(definition.type, Boolean(targetParentId || customOrganism)),
      height: defaultComponentHeight(definition.type, customOrganism?.components.length, Boolean(targetParentId)),
      x: 0,
      y: components.length,
      children: definition.type === 'Form' ? [] : undefined,
    };

    if (targetParentId && definition.type !== 'Form') {
      setComponents((current) => appendChildComponent(current, targetParentId, next));
      setSelectedId(next.id);
      setStatusMessage(`${definition.label} added inside Form`);
      return;
    }

    setComponents((current) => {
      const nextComponents = [...current];
      const boundedIndex = Math.max(0, Math.min(insertIndex, current.length));
      nextComponents.splice(boundedIndex, 0, next);

      return withCanvasOrder(nextComponents);
    });
    setSelectedId(next.id);
    setStatusMessage(`${definition.label} added to canvas`);
  }

  function relocateComponent(componentId: string, direction: ComponentMoveDirection) {
    const component = findComponentById(components, componentId);

    if (!component) {
      return;
    }

    const parentId = findParentComponentId(components, componentId);

    if (parentId && (direction === 'up' || direction === 'down')) {
      setComponents((current) => moveChildByDirection(current, parentId, componentId, direction));
      setSelectedId(componentId);
      setStatusMessage(`${component.label} moved ${direction} inside Form`);
      return;
    }

    if (direction === 'up' || direction === 'down') {
      const currentIndex = components.findIndex((current) => current.id === componentId);
      const nextIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

      if (currentIndex < 0 || nextIndex < 0 || nextIndex >= components.length) {
        return;
      }

      setComponents((current) => {
        const nextComponents = [...current];
        const [moved] = nextComponents.splice(currentIndex, 1);
        nextComponents.splice(nextIndex, 0, moved);

        return withCanvasOrder(nextComponents);
      });
      setSelectedId(componentId);
      setStatusMessage(`${component.label} moved ${direction}`);
      return;
    }

    setComponents((current) => updateComponentById(current, componentId, (item) => {
      const nextX = direction === 'left' ? item.x - 1 : item.x + 1;

      return normalizeCanvasComponent({ ...item, x: nextX }, item.y);
    }));
    setSelectedId(componentId);
    setStatusMessage(`${component.label} moved ${direction}`);
  }

  function moveComponentToIndex(componentId: string, targetIndex: number) {
    const component = findComponentById(components, componentId);

    if (!component) {
      return;
    }

    const parentId = findParentComponentId(components, componentId);

    if (parentId) {
      setComponents((current) => moveChildToIndex(current, parentId, componentId, targetIndex));
      setSelectedId(componentId);
      setStatusMessage(`${component.label} relocated inside Form`);
      return;
    }

    setComponents((current) => {
      const fromIndex = current.findIndex((item) => item.id === componentId);

      if (fromIndex < 0) {
        return current;
      }

      const boundedIndex = clamp(targetIndex, 0, current.length - 1);

      if (fromIndex === boundedIndex) {
        return current;
      }

      const nextComponents = [...current];
      const [moved] = nextComponents.splice(fromIndex, 1);
      nextComponents.splice(boundedIndex, 0, moved);

      return withCanvasOrder(nextComponents);
    });
    setSelectedId(componentId);
    setStatusMessage(`${component.label} relocated`);
  }

  function updateComponentLayout(componentId: string, next: Partial<Pick<CanvasComponent, 'height' | 'width' | 'x'>>) {
    const component = findComponentById(components, componentId);

    if (!component) {
      return;
    }

    setComponents((current) => updateComponentById(current, componentId, (item) => normalizeCanvasComponent({ ...item, ...next }, item.y)));
    setSelectedId(componentId);
    setStatusMessage(`${component.label} layout updated`);
  }

  function resizeComponent(componentId: string, direction: ComponentResizeDirection) {
    const component = findComponentById(components, componentId);

    if (!component) {
      return;
    }

    setComponents((current) => updateComponentById(current, componentId, (item) => {
      if (item.id !== componentId) {
        return item;
      }

      const nextWidth = direction === 'narrower' ? item.width - 1 : direction === 'wider' ? item.width + 1 : item.width;
      const nextHeight = direction === 'shorter' ? item.height - 16 : direction === 'taller' ? item.height + 16 : item.height;

      return normalizeCanvasComponent({ ...item, width: nextWidth, height: nextHeight }, item.y);
    }));
    setSelectedId(componentId);
    setStatusMessage(`${component.label} resized`);
  }

  function bindField(object: string, field: string) {
    if (!selected) {
      const next: CanvasComponent = {
        id: `${object}_${field}_${Date.now()}`,
        type: field === 'stock' || field === 'price' ? 'NumberInput' : 'TextInput',
        label: `${object} ${field}`,
        width: 6,
        height: 86,
        x: 0,
        y: components.length,
        binding: { object, field },
      };
      setComponents((current) => withCanvasOrder([...current, next]));
      setSelectedId(next.id);
      setStatusMessage(`${object}.${field} added as a bound component`);
      return;
    }

    setComponents((current) => updateComponentById(current, selected.id, (component) => ({ ...component, binding: { object, field } })));
    setStatusMessage(`${selected.label} bound to ${object}.${field}`);
  }

  function updateSelected(next: Partial<CanvasComponent>) {
    if (!selected) {
      return;
    }

    setComponents((current) => updateComponentById(current, selected.id, (component) => normalizeCanvasComponent({ ...component, ...next }, component.y)));
    setStatusMessage(`${selected.label} updated`);
  }

  function deleteComponent(componentId: string) {
    const component = findComponentById(components, componentId);

    if (!component) {
      return;
    }

    const selectedIndex = components.findIndex((current) => current.id === component.id);
    const nextComponents = removeComponentById(components, component.id);
    const nextSelected = findNearestSelection(nextComponents, selectedIndex);

    setComponents(withCanvasOrder(nextComponents));
    setSelectedId(nextSelected?.id ?? '');
    setStatusMessage(`${component.label} removed from canvas`);
  }

  function deleteSelected() {
    if (!selected) {
      return;
    }

    deleteComponent(selected.id);
  }

  function saveDraft() {
    const savedAt = new Date().toISOString();
    window.localStorage.setItem(builderDraftKey(target), JSON.stringify({ components, device, selectedId, savedAt, theme }));
    setStatusMessage(`Experience draft saved at ${formatSavedAt(savedAt)}`);
  }

  function loadTemplate(templateId: string) {
    const template = builderTemplates.find((current) => current.id === templateId);

    if (!template) {
      return;
    }

    const nextComponents = withCanvasOrder(template.components.map(cloneTemplateComponent));
    setComponents(nextComponents);
    setSelectedId(nextComponents[0]?.id ?? '');
    setStatusMessage(`${template.label} template loaded`);
  }

  function previewExperience() {
    setIsPreviewing((current) => !current);
    setStatusMessage(isPreviewing ? 'Builder canvas mode active' : 'Runtime preview mode active');
  }

  function publishExperience() {
    const savedAt = new Date().toISOString();
    const applicationCode = resolvePublishedApplicationCode(target);
    const productionPath = `/apps/${applicationCode}`;

    window.localStorage.setItem(builderDraftKey(target), JSON.stringify({ components, device, selectedId, savedAt, theme }));
    setStatusMessage(`Published draft opened at ${productionPath}`);
    window.open(productionPath, '_blank', 'noopener,noreferrer');
  }

  return (
    <main className="redos-builder-page" data-redos-builder-theme={theme.toLowerCase()}>
      <header className="redos-builder-header">
        <div>
          <span className="redos-kicker">RediOS Builder</span>
          <h1>{target === 'android' ? 'Android Experience Builder' : 'Visual Application Builder'}</h1>
          <p>Bangun screen dulu. Data dan Action dipasang setelah experience terasa benar.</p>
        </div>
        <div className="redos-actions">
          <select
            aria-label="Load template"
            data-redos-tooltip="Load template siap pakai seperti Create Account, Survey, atau Asset Table."
            defaultValue=""
            onChange={(event) => {
              loadTemplate(event.target.value);
              event.currentTarget.value = '';
            }}
          >
            <option value="" disabled>Load template</option>
            {builderTemplates.map((template) => <option key={template.id} value={template.id}>{template.label}</option>)}
          </select>
          <button data-redos-tooltip="Mulai aplikasi baru dari template experience, bukan dari database." type="button" onClick={() => { window.location.href = '/studio/create'; }}>Create App</button>
          <button data-redos-tooltip="Simpan draft layout visual di browser. Backend metadata sync menyusul di tahap production." type="button" onClick={saveDraft}>Save</button>
          <button className="redos-launch-action" data-redos-tooltip="Publish draft dan buka hasil production di tab baru." type="button" onClick={publishExperience}>Publish</button>
          <button data-redos-tooltip="Advanced Mode untuk Data, Action, Connector, dan Custom Organism." type="button" onClick={() => { window.location.href = '/studio/metadata'; }}>Metadata</button>
        </div>
      </header>

      <section className="redos-builder-status" aria-live="polite">
        <div>
          <strong>{statusMessage}</strong>
          <span>{target === 'android' ? 'Mobile runtime target' : 'Web runtime target'} · {device} preview</span>
        </div>
        <div className="redos-metadata-pills" aria-label="Generated metadata summary">
          <span>{metadataSummary.components} Components</span>
          <span>{metadataSummary.fields} Data bindings</span>
          <span>{metadataSummary.actions} Actions</span>
        </div>
      </section>

      <section className={[
        'redos-builder-workspace',
        isPreviewing ? 'redos-builder-workspace-preview' : '',
        isToolboxCollapsed ? 'redos-builder-workspace-toolbox-collapsed' : '',
      ].filter(Boolean).join(' ')}
      >
        {!isPreviewing ? (
          <aside className={isToolboxCollapsed ? 'redos-left-panel redos-left-panel-collapsed' : 'redos-left-panel'}>
            <button
              aria-label={isToolboxCollapsed ? 'Show elements panel' : 'Hide elements panel'}
              className="redos-panel-collapse-button"
              data-redos-tooltip={isToolboxCollapsed ? 'Tampilkan Elements' : 'Sembunyikan Elements'}
              type="button"
              onClick={() => setIsToolboxCollapsed((current) => !current)}
            >
              {isToolboxCollapsed ? '→' : '←'}
            </button>
            {!isToolboxCollapsed ? (
              <>
            <div className="redos-tabs">
              {(['Components', 'Data'] as const).map((nextTab) => (
                <button key={nextTab} className={tab === nextTab ? 'redos-tab-active' : ''} type="button" onClick={() => setTab(nextTab)}>
                  {nextTab}
                </button>
              ))}
            </div>
            {tab === 'Components' ? (
              <ComponentPanel target={target} onAdd={addComponent} />
            ) : (
              <TreePanel dataObjects={dataObjects} onBindField={bindField} />
            )}
              </>
            ) : null}
          </aside>
        ) : null}

        <BuilderSideToolbar
          device={device}
          isPreviewing={isPreviewing}
          target={target}
          onDeviceChange={setDevice}
          onPreviewToggle={previewExperience}
        />

        <Canvas
          components={components}
          device={device}
          isPreviewing={isPreviewing}
          selectedId={isPreviewing ? undefined : selectedId}
          target={target}
          onAddComponent={addComponent}
          onDeleteComponent={deleteComponent}
          onMoveComponentToIndex={moveComponentToIndex}
          onRelocateComponent={relocateComponent}
          onResizeComponent={resizeComponent}
          onSelect={setSelectedId}
          onUpdateComponentLayout={updateComponentLayout}
        />

        {!isPreviewing ? (
          <PropertyPanel
            components={components}
            dataObjects={dataObjects}
            selected={selected}
            theme={theme}
            onChange={updateSelected}
            onDelete={deleteSelected}
            onThemeChange={setTheme}
          />
        ) : null}
      </section>
    </main>
  );
}

function BuilderSideToolbar({
  device,
  isPreviewing,
  onDeviceChange,
  onPreviewToggle,
  target,
}: {
  device: StudioDevice;
  isPreviewing: boolean;
  onDeviceChange: (device: StudioDevice) => void;
  onPreviewToggle: () => void;
  target: StudioTarget;
}) {
  return (
    <aside className="redos-builder-side-toolbar" aria-label="Builder view controls">
      <button
        className={!isPreviewing ? 'redos-side-tool-active' : ''}
        data-redos-tooltip="Edit mode: susun komponen dan metadata."
        type="button"
        onClick={() => {
          if (isPreviewing) {
            onPreviewToggle();
          }
        }}
      >
        ✎
      </button>
      <button
        className={isPreviewing ? 'redos-side-tool-active' : ''}
        data-redos-tooltip="Preview mode: lihat seperti runtime."
        type="button"
        onClick={() => {
          if (!isPreviewing) {
            onPreviewToggle();
          }
        }}
      >
        ◉
      </button>
      <button
        className={target === 'web' ? 'redos-side-tool-active' : ''}
        data-redos-tooltip="Web builder"
        type="button"
        onClick={() => { window.location.href = '/studio/builder/web'; }}
      >
        &lt;/&gt;
      </button>
      <button
        className={target === 'android' ? 'redos-side-tool-active' : ''}
        data-redos-tooltip="Android builder"
        type="button"
        onClick={() => { window.location.href = '/studio/builder/android'; }}
      >
        ▯
      </button>
      <span aria-hidden="true" />
      {(['Desktop', 'Tablet', 'Mobile'] as const).map((nextDevice) => (
        <button
          key={nextDevice}
          className={device === nextDevice ? 'redos-side-tool-active' : ''}
          data-redos-tooltip={`${nextDevice} preview`}
          type="button"
          onClick={() => onDeviceChange(nextDevice)}
        >
          {nextDevice === 'Desktop' ? '▭' : nextDevice === 'Tablet' ? '▯' : '▥'}
        </button>
      ))}
    </aside>
  );
}

function withCanvasOrder(components: CanvasComponent[]) {
  return components.map((component, index) => normalizeCanvasComponent(component, index));
}

function normalizeCanvasComponent(component: CanvasComponent, index: number): CanvasComponent {
  const width = clamp(Number(component.width) || 6, MIN_COMPONENT_WIDTH, GRID_COLUMNS);
  const height = clamp(Number(component.height) || 86, MIN_COMPONENT_HEIGHT, MAX_COMPONENT_HEIGHT);
  const x = clamp(Number(component.x) || 0, 0, GRID_COLUMNS - width);
  const children: CanvasComponent[] | undefined = component.children?.map((child, childIndex) => normalizeCanvasComponent(child, childIndex));

  return {
    ...component,
    width,
    height,
    x,
    y: index,
    children,
  };
}

function appendChildComponent(components: CanvasComponent[], parentId: string, child: CanvasComponent): CanvasComponent[] {
  return components.map((component, index) => {
    if (component.id === parentId) {
      const nextChildren = [...(component.children ?? []), normalizeCanvasComponent(child, component.children?.length ?? 0)];
      const nextHeight = Math.max(component.height, 120 + nextChildren.length * 92);

      return normalizeCanvasComponent({ ...component, children: nextChildren, height: nextHeight }, index);
    }

    if (component.children?.length) {
      return normalizeCanvasComponent({ ...component, children: appendChildComponent(component.children, parentId, child) }, index);
    }

    return normalizeCanvasComponent(component, index);
  });
}

function updateComponentById(
  components: CanvasComponent[],
  componentId: string,
  updater: (component: CanvasComponent) => CanvasComponent,
): CanvasComponent[] {
  return components.map((component, index) => {
    if (component.id === componentId) {
      return normalizeCanvasComponent(updater(component), index);
    }

    if (component.children?.length) {
      return normalizeCanvasComponent({ ...component, children: updateComponentById(component.children, componentId, updater) }, index);
    }

    return normalizeCanvasComponent(component, index);
  });
}

function removeComponentById(components: CanvasComponent[], componentId: string): CanvasComponent[] {
  return components
    .filter((component) => component.id !== componentId)
    .map((component, index) => {
      if (component.children?.length) {
        return normalizeCanvasComponent({ ...component, children: removeComponentById(component.children, componentId) }, index);
      }

      return normalizeCanvasComponent(component, index);
    });
}

function moveChildByDirection(
  components: CanvasComponent[],
  parentId: string,
  childId: string,
  direction: Extract<ComponentMoveDirection, 'up' | 'down'>,
): CanvasComponent[] {
  return components.map((component, index) => {
    if (component.id === parentId) {
      const currentIndex = component.children?.findIndex((child) => child.id === childId) ?? -1;

      if (currentIndex < 0) {
        return normalizeCanvasComponent(component, index);
      }

      const nextIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

      return normalizeCanvasComponent({
        ...component,
        children: moveItemToIndex(component.children ?? [], currentIndex, nextIndex),
      }, index);
    }

    if (component.children?.length) {
      return normalizeCanvasComponent({ ...component, children: moveChildByDirection(component.children, parentId, childId, direction) }, index);
    }

    return normalizeCanvasComponent(component, index);
  });
}

function moveChildToIndex(components: CanvasComponent[], parentId: string, childId: string, targetIndex: number): CanvasComponent[] {
  return components.map((component, index) => {
    if (component.id === parentId) {
      const currentIndex = component.children?.findIndex((child) => child.id === childId) ?? -1;

      if (currentIndex < 0) {
        return normalizeCanvasComponent(component, index);
      }

      return normalizeCanvasComponent({
        ...component,
        children: moveItemToIndex(component.children ?? [], currentIndex, targetIndex),
      }, index);
    }

    if (component.children?.length) {
      return normalizeCanvasComponent({ ...component, children: moveChildToIndex(component.children, parentId, childId, targetIndex) }, index);
    }

    return normalizeCanvasComponent(component, index);
  });
}

function moveItemToIndex(items: CanvasComponent[], fromIndex: number, targetIndex: number): CanvasComponent[] {
  if (items.length === 0 || fromIndex < 0) {
    return items;
  }

  const boundedIndex = clamp(targetIndex, 0, items.length - 1);

  if (fromIndex === boundedIndex) {
    return items;
  }

  const nextItems = [...items];
  const [moved] = nextItems.splice(fromIndex, 1);
  nextItems.splice(boundedIndex, 0, moved);

  return nextItems.map((item, index) => normalizeCanvasComponent(item, index));
}

function findComponentById(components: CanvasComponent[], componentId?: string): CanvasComponent | undefined {
  if (!componentId) {
    return undefined;
  }

  for (const component of components) {
    if (component.id === componentId) {
      return component;
    }

    const child = findComponentById(component.children ?? [], componentId);

    if (child) {
      return child;
    }
  }

  return undefined;
}

function findParentComponentId(components: CanvasComponent[], componentId?: string): string | undefined {
  if (!componentId) {
    return undefined;
  }

  for (const component of components) {
    if (component.children?.some((child) => child.id === componentId)) {
      return component.id;
    }

    const parentId = findParentComponentId(component.children ?? [], componentId);

    if (parentId) {
      return parentId;
    }
  }

  return undefined;
}

function flattenComponents(components: CanvasComponent[]): CanvasComponent[] {
  return components.flatMap((component) => [component, ...flattenComponents(component.children ?? [])]);
}

function findNearestSelection(components: CanvasComponent[], selectedIndex: number) {
  const flatComponents = flattenComponents(components);

  return flatComponents[Math.max(0, Math.min(selectedIndex, flatComponents.length - 1))];
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

function defaultComponentWidth(type: string, insideContainer: boolean) {
  if (insideContainer) {
    if (['DataTable', 'InputTable', 'Modal', 'ConfirmModal'].includes(type)) {
      return 12;
    }

    if (['Button', 'Submit', 'ToggleSwitch', 'Slider', 'RangeSlider'].includes(type)) {
      return 4;
    }

    if (['Image', 'UploadField', 'ImageUpload', 'MultiFileUpload', 'MultiImageUpload', 'Signature'].includes(type)) {
      return 6;
    }

    return 12;
  }

  return type === 'Button' || ['Form', 'DataTable', 'InputTable', 'Modal', 'ConfirmModal', 'SingleChoiceMatrix', 'MultipleChoiceMatrix', 'MatrixTable', 'Group', 'Grid', 'Pages'].includes(type) ? 12 : 6;
}

function defaultComponentHeight(type: string, customOrganismComponentCount?: number, insideContainer = false) {
  if (customOrganismComponentCount !== undefined) {
    return Math.max(170, customOrganismComponentCount * 70 + 96);
  }

  if (insideContainer && ['TextInput', 'NumberInput', 'EmailInput', 'PhoneInput', 'PasswordInput', 'UrlInput', 'LocationInput', 'Search', 'Dropdown', 'Lookup', 'TextArea'].includes(type)) {
    return type === 'TextArea' ? 72 : 60;
  }

  if (type === 'Table') {
    return 180;
  }

  if (type === 'Form') {
    return 220;
  }

  if (['DataTable', 'InputTable', 'SingleChoiceMatrix', 'MultipleChoiceMatrix', 'MatrixTable'].includes(type)) {
    return 260;
  }

  if (type === 'Modal') {
    return 300;
  }

  if (type === 'ConfirmModal') {
    return 220;
  }

  if (['Image', 'UploadField', 'ImageUpload', 'MultiFileUpload', 'MultiImageUpload', 'Signature'].includes(type)) {
    return 132;
  }

  if (['FormHeading', 'SectionHeading', 'Subheading', 'Divider', 'Spacer', 'Submit', 'ToggleSwitch', 'Slider', 'RangeSlider'].includes(type)) {
    return 64;
  }

  return 86;
}

function cloneTemplateComponent(component: CanvasComponent): CanvasComponent {
  const uniqueId = `${component.id}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

  return {
    ...component,
    id: uniqueId,
    children: component.children?.map(cloneTemplateComponent),
  };
}

function builderDraftKey(target: StudioTarget) {
  return `redios:studio:${target}:draft`;
}

function resolvePublishedApplicationCode(target: StudioTarget) {
  const [, root, route, appCode] = window.location.pathname.split('/');

  if (root === 'studio' && route === 'apps' && appCode) {
    return appCode;
  }

  return window.localStorage.getItem(`${ACTIVE_APP_KEY_PREFIX}:${target}`) ?? 'REDIOS_EXPERIENCE';
}

function loadBuilderDraft(target: StudioTarget): BuilderDraftState | undefined {
  try {
    const rawDraft = window.localStorage.getItem(builderDraftKey(target));

    if (!rawDraft) {
      return undefined;
    }

    const draft = JSON.parse(rawDraft) as BuilderDraftState;

    if (!Array.isArray(draft.components) || !draft.selectedId || !draft.device) {
      return undefined;
    }

    return {
      ...draft,
      components: withCanvasOrder(draft.components),
    };
  } catch {
    return undefined;
  }
}

function formatSavedAt(value: string) {
  return new Intl.DateTimeFormat('en', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}
