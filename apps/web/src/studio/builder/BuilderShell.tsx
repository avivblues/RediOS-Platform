import { type ReactNode, useMemo, useState } from 'react';
import { Canvas } from './Canvas/Canvas';
import { ComponentPanel } from './ComponentPanel/ComponentPanel';
import { PropertyPanel } from './PropertyPanel/PropertyPanel';
import { TreePanel } from './TreePanel/TreePanel';
import {
  findCustomOrganism,
  loadActions,
  loadCustomApis,
  loadCustomOrganisms,
  loadDataObjects,
  loadMenu,
  loadProcesses,
  loadQueries,
  loadSecurity,
  loadScreens,
  loadStudioApplications,
  publishApplicationPackage,
  resolveActiveApplicationCode,
  saveActions,
  saveDataObjects,
  saveScreens,
  setActiveApplicationCode,
  toApplicationSlug,
  toMetadataCode,
  type StudioActionDraft,
  type StudioDataAttribute,
  type StudioDataObject,
  type StudioScreenDraft,
} from '../metadata/metadata-store';
import { AdminGuidePanel } from '../guide/AdminGuide';
import { tailAdminPageTemplates } from '../templates/tailadmin-template-registry';
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

const GRID_COLUMNS = 12;
const MIN_COMPONENT_WIDTH = 2;
const MIN_COMPONENT_HEIGHT = 48;
const MAX_COMPONENT_HEIGHT = 420;

const initialComponents: CanvasComponent[] = [
  {
    id: 'product_form',
    type: 'Form',
    label: 'Product Form',
    width: 12,
    height: 360,
    x: 0,
    y: 0,
    children: [
      {
        id: 'product_name',
        type: 'TextInput',
        label: 'Product Name',
        placeholder: 'Enter product name',
        width: 12,
        height: 60,
        x: 0,
        y: 0,
        binding: { object: 'Product', field: 'name' },
      },
      {
        id: 'product_stock',
        type: 'NumberInput',
        label: 'Stock',
        placeholder: 'Enter stock',
        width: 6,
        height: 60,
        x: 0,
        y: 1,
        binding: { object: 'Product', field: 'stock' },
      },
      {
        id: 'product_price',
        type: 'NumberInput',
        label: 'Price',
        placeholder: 'Enter price',
        width: 6,
        height: 60,
        x: 6,
        y: 2,
        binding: { object: 'Product', field: 'price' },
      },
      {
        id: 'save_product',
        type: 'Button',
        label: 'Save Product',
        width: 4,
        height: 56,
        x: 0,
        y: 3,
        events: { onClick: 'Save Product' },
      },
    ],
  },
];

const builderTemplates = tailAdminPageTemplates.map((template) => ({
  components: template.components,
  id: template.code,
  label: template.label,
}));

export function BuilderShell({ target }: { target: StudioTarget }) {
  const applications = useMemo(() => loadStudioApplications(), []);
  const initialApplicationCode = applications.find((application) => application.code === resolveActiveApplicationCode(target))?.code
    ?? applications[0]?.code
    ?? resolveActiveApplicationCode(target);
  const initialDataObjectDrafts = loadDataObjects(initialApplicationCode);
  const initialScreens = ensureApplicationScreens(loadScreens(initialApplicationCode), initialDataObjectDrafts, target);
  const initialScreen = initialScreens.find((screen) => screen.target === target) ?? initialScreens[0];
  const [applicationCode, setApplicationCode] = useState(initialApplicationCode);
  const [screens, setScreens] = useState(initialScreens);
  const [screenCode, setScreenCode] = useState(initialScreen?.code ?? defaultScreenCode(initialDataObjectDrafts[0]?.name));
  const [screenSearch, setScreenSearch] = useState(initialScreen ? screenOptionLabel(initialScreen) : '');
  const [screenObjectName, setScreenObjectName] = useState(initialScreen?.objectName ?? initialDataObjectDrafts[0]?.name ?? '');
  const [metadataVersion, setMetadataVersion] = useState(0);
  const selectedScreen = screens.find((screen) => screen.code === screenCode);
  const dataObjectDrafts = useMemo(() => loadDataObjects(applicationCode), [applicationCode, metadataVersion]);
  const dataObjects = useMemo<BuilderDataObject[]>(() => dataObjectDrafts.map((object) => ({
    name: object.name,
    fields: object.attributes.map((attribute) => attribute.name),
  })), [dataObjectDrafts]);
  const savedDraft = loadBuilderDraft(target, applicationCode, screenCode);
  const starterComponents = dataObjects.length === 0 ? [] : componentsForObject(screenObjectName || dataObjectDrafts[0]?.name, dataObjectDrafts, initialScreen?.mode);
  const [device, setDevice] = useState<StudioDevice>(savedDraft?.device ?? (target === 'android' ? 'Mobile' : 'Desktop'));
  const [tab, setTab] = useState<'Components' | 'Data'>('Components');
  const [components, setComponents] = useState(savedDraft?.components ?? starterComponents);
  const [selectedId, setSelectedId] = useState(savedDraft?.selectedId ?? starterComponents[0]?.id ?? '');
  const [statusMessage, setStatusMessage] = useState(savedDraft ? `Draft restored from ${formatSavedAt(savedDraft.savedAt)}` : 'Draft ready');
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isToolboxCollapsed, setIsToolboxCollapsed] = useState(false);
  const [isSideToolbarCollapsed, setIsSideToolbarCollapsed] = useState(false);
  const [theme, setTheme] = useState<BuilderTheme>(savedDraft?.theme ?? 'Light');
  const [saveConfirmationOpen, setSaveConfirmationOpen] = useState(false);
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

  function persistCurrentDraft(nextComponents = components) {
    const savedAt = new Date().toISOString();
    window.localStorage.setItem(builderDraftKey(target, applicationCode, screenCode), JSON.stringify({ components: nextComponents, device, selectedId, savedAt, theme }));

    return savedAt;
  }

  function openBuilderContext(nextApplicationCode: string, nextScreenCode: string, nextScreens = screens, nextDataObjects = dataObjectDrafts) {
    const nextScreen = nextScreens.find((screen) => screen.code === nextScreenCode) ?? nextScreens[0];
    const nextObjectName = nextScreen?.objectName ?? nextDataObjects[0]?.name ?? '';
    const nextDraft = loadBuilderDraft(target, nextApplicationCode, nextScreen?.code ?? defaultScreenCode(nextObjectName));
    const nextComponents = nextDraft?.components ?? componentsForObject(nextObjectName, nextDataObjects, nextScreen?.mode);

    setScreenCode(nextScreen?.code ?? defaultScreenCode(nextObjectName));
    setScreenSearch(nextScreen ? screenOptionLabel(nextScreen) : '');
    setScreenObjectName(nextObjectName);
    setComponents(nextComponents);
    setSelectedId(nextDraft?.selectedId ?? nextComponents[0]?.id ?? '');
    setDevice(nextDraft?.device ?? (target === 'android' ? 'Mobile' : 'Desktop'));
    setTheme(nextDraft?.theme ?? 'Light');
    setStatusMessage(nextDraft ? `Draft restored from ${formatSavedAt(nextDraft.savedAt)}` : `Editing ${nextScreen?.label ?? 'New Screen'}`);
  }

  function changeApplication(nextApplicationCode: string) {
    persistCurrentDraft();
    const nextApplication = applications.find((application) => application.code === nextApplicationCode);
    const nextDataObjects = loadDataObjects(nextApplicationCode);
    const nextScreens = ensureApplicationScreens(loadScreens(nextApplicationCode), nextDataObjects, target);

    if (loadScreens(nextApplicationCode).length === 0 && nextScreens.length > 0) {
      saveScreens(nextScreens, nextApplicationCode);
    }

    setApplicationCode(nextApplicationCode);
    setScreens(nextScreens);
    if (nextApplication) {
      setActiveApplicationCode(nextApplication.target, nextApplication.code);
    }
    setScreenSearch(nextScreens[0] ? screenOptionLabel(nextScreens[0]) : '');
    openBuilderContext(nextApplicationCode, nextScreens[0]?.code ?? defaultScreenCode(nextDataObjects[0]?.name), nextScreens, nextDataObjects);
  }

  function changeScreen(nextScreenCode: string) {
    persistCurrentDraft();
    openBuilderContext(applicationCode, nextScreenCode);
  }

  function searchScreen(value: string) {
    setScreenSearch(value);

    const matchedScreen = screens.find((screen) => screenOptionLabel(screen) === value || screen.label === value || screen.code === value);

    if (matchedScreen && matchedScreen.code !== screenCode) {
      changeScreen(matchedScreen.code);
    }
  }

  function changeScreenObject(nextObjectName: string) {
    const nextScreens = screens.map((screen) => screen.code === screenCode ? {
      ...screen,
      objectName: nextObjectName || undefined,
      updatedAt: new Date().toISOString(),
    } : screen);

    setScreens(nextScreens);
    saveScreens(nextScreens, applicationCode);
    setScreenObjectName(nextObjectName);
    setStatusMessage(nextObjectName ? `${selectedScreen?.label ?? screenCode} linked to ${nextObjectName}` : `${selectedScreen?.label ?? screenCode} is unbound`);
  }

  function changeScreenMode(nextMode: StudioScreenDraft['mode']) {
    const existingScreen = screens.find((screen) =>
      screen.code !== screenCode
      && screen.objectName === screenObjectName
      && screen.mode === nextMode
      && screen.target === target);

    if (existingScreen) {
      persistCurrentDraft();
      openBuilderContext(applicationCode, existingScreen.code, screens);
      setStatusMessage(`${screenOptionLabel(existingScreen)} sudah ada. Builder membuka screen existing.`);
      return;
    }

    const nextScreens = screens.map((screen) => screen.code === screenCode ? {
      ...screen,
      label: screenLabelForMode(screen.objectName ?? screenObjectName, nextMode),
      mode: nextMode,
      updatedAt: new Date().toISOString(),
    } : screen);
    const nextComponents = componentsForObject(screenObjectName, dataObjectDrafts, nextMode);

    setScreens(nextScreens);
    setComponents(nextComponents);
    setSelectedId(nextComponents[0]?.id ?? '');
    saveScreens(nextScreens, applicationCode);
    setScreenSearch(screenOptionLabel(nextScreens.find((screen) => screen.code === screenCode) ?? selectedScreen));
    setStatusMessage(`${selectedScreen?.label ?? screenCode} mode set to ${screenModeLabel(nextMode)} dan default screen dibuat dari Data Designer`);
  }

  function createScreenForCurrentObject() {
    const objectName = screenObjectName || dataObjectDrafts[0]?.name;
    const preferredMode = selectedScreen?.mode ?? 'create';
    const mode = nextCreatableScreenMode(screens, objectName, target, preferredMode);
    const existingScreen = screens.find((screen) => screen.objectName === objectName && screen.mode === mode && screen.target === target);

    if (existingScreen) {
      persistCurrentDraft();
      openBuilderContext(applicationCode, existingScreen.code, screens);
      setStatusMessage(`Semua mode screen untuk ${objectName ?? 'object ini'} sudah ada. Builder membuka ${screenOptionLabel(existingScreen)}.`);
      return;
    }

    const codeBase = modeScreenCode(objectName, mode);
    const code = uniqueScreenCode(codeBase, screens);
    const nextScreen: StudioScreenDraft = {
      code,
      label: screenLabelForMode(objectName, mode),
      objectName,
      mode,
      target,
      updatedAt: new Date().toISOString(),
    };
    const nextScreens = [nextScreen, ...screens];

    persistCurrentDraft();
    setScreens(nextScreens);
    saveScreens(nextScreens, applicationCode);
    openBuilderContext(applicationCode, code, nextScreens);
  }

  function addComponent(definition: BuilderComponentDefinition, insertIndex = components.length, parentId?: string) {
    const customOrganism = findCustomOrganism(definition.type, applicationCode);
    const selectedParentId = selected?.type === 'Form' ? selected.id : findParentComponentId(components, selectedId);
    const targetParentId = parentId ?? selectedParentId;
    const next: CanvasComponent = {
      id: `${definition.type}_${Date.now()}`,
      type: definition.type,
      label: definition.label,
      width: definition.defaultSize?.width ?? defaultComponentWidth(definition.type, Boolean(targetParentId || customOrganism)),
      height: definition.defaultSize?.height ?? defaultComponentHeight(definition.type, customOrganism?.components.length, Boolean(targetParentId)),
      x: 0,
      y: components.length,
      children: definition.type === 'Form' ? [] : undefined,
      template: definition.defaultConfig,
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
    const syncedMetadata = syncBuilderMetadataToDesigners({
      applicationCode,
      components,
      screenObjectName,
    });
    const savedAt = persistCurrentDraft(syncedMetadata.components);

    setComponents(syncedMetadata.components);
    setMetadataVersion((current) => current + 1);
    saveScreens(screens, applicationCode);
    setSaveConfirmationOpen(false);
    setStatusMessage(`Experience draft saved at ${formatSavedAt(savedAt)} · DATA/ACTION metadata synced`);
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
    const nextPreviewing = !isPreviewing;
    setIsPreviewing(nextPreviewing);
    setIsSideToolbarCollapsed(nextPreviewing);
    setStatusMessage(nextPreviewing ? 'Runtime preview mode active. Toolbar auto-hidden.' : 'Builder canvas mode active');
  }

  function publishExperience() {
    const savedAt = new Date().toISOString();
    const appSlug = resolvePublishedApplicationSlug(target, applicationCode);
    const productionPath = `/apps/${appSlug}`;
    const syncedMetadata = syncBuilderMetadataToDesigners({
      applicationCode,
      components,
      screenObjectName,
    });

    setComponents(syncedMetadata.components);
    setMetadataVersion((current) => current + 1);
    window.localStorage.setItem(builderDraftKey(target, applicationCode, screenCode), JSON.stringify({ components: syncedMetadata.components, device, selectedId, savedAt, theme }));
    saveScreens(screens, applicationCode);
    publishApplicationPackage({
      appCode: applicationCode,
      appSlug,
      appName: applicationNameFromCode(applicationCode),
      target,
      dataObjects: syncedMetadata.dataObjects,
      queries: loadQueries(applicationCode),
      actions: syncedMetadata.actions,
      connectors: loadCustomApis(applicationCode),
      processes: loadProcesses(applicationCode),
      menu: loadMenu(applicationCode),
      screens,
      security: loadSecurity(applicationCode),
      customOrganisms: loadCustomOrganisms(applicationCode),
      canvas: syncedMetadata.components,
      screenCanvases: collectPublishedScreenCanvases({
        activeComponents: syncedMetadata.components,
        activeScreenCode: screenCode,
        applicationCode,
        dataObjects: syncedMetadata.dataObjects,
        screens,
        target,
      }),
      theme: {
        name: theme,
        tokens: collectBuilderThemeTokens(),
      },
      publishedAt: savedAt,
    });
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
          <button data-redos-tooltip="Konfirmasi lalu simpan canvas dan screen metadata aktif." type="button" onClick={() => setSaveConfirmationOpen(true)}>Save</button>
          <button className="redos-launch-action" data-redos-tooltip="Publish draft dan buka hasil production di tab baru." type="button" onClick={publishExperience}>Publish</button>
          <button data-redos-tooltip="Advanced Mode untuk Data, Action, Process, Menu, Security, dan Custom Organism." type="button" onClick={() => { window.location.href = '/studio/metadata'; }}>Metadata</button>
          <button data-redos-tooltip="Kelola reusable datasource untuk table, lookup, report, dan dashboard." type="button" onClick={() => { window.location.href = '/studio/query'; }}>Query Builder</button>
          <button data-redos-tooltip="Kelola generated API dan connector external." type="button" onClick={() => { window.location.href = '/studio/api'; }}>API Builder</button>
        </div>
      </header>

      <section className="redos-builder-status" aria-live="polite">
        <div>
          <strong>{statusMessage}</strong>
          <span>{target === 'android' ? 'Mobile runtime target' : 'Web runtime target'} · {device} preview</span>
        </div>
        {!isPreviewing ? (
          <div className="redos-builder-context-bar" aria-label="Builder context">
            <label>
              <span>Application</span>
              <select value={applicationCode} onChange={(event) => changeApplication(event.target.value)}>
                {applications.map((application) => (
                  <option key={application.code} value={application.code}>{application.name}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Screen / Form</span>
              <input
                list="redos-builder-screen-options"
                placeholder="Search screen/form"
                value={screenSearch}
                onChange={(event) => searchScreen(event.target.value)}
              />
              <datalist id="redos-builder-screen-options">
                {screens.map((screen) => (
                  <option key={screen.code} value={screenOptionLabel(screen)} />
                ))}
              </datalist>
            </label>
            <label>
              <span>Mode</span>
              <select value={selectedScreen?.mode ?? 'create'} onChange={(event) => changeScreenMode(event.target.value as StudioScreenDraft['mode'])}>
                <option value="create">Input Form</option>
                <option value="edit">Edit Form</option>
                <option value="detail">Detail View</option>
                <option value="table">Table View</option>
                <option value="list">List View</option>
              </select>
            </label>
            <button type="button" onClick={createScreenForCurrentObject}>New Screen</button>
          </div>
        ) : null}
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
        isSideToolbarCollapsed ? 'redos-builder-workspace-toolbar-collapsed' : '',
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
              <ComponentPanel applicationCode={applicationCode} target={target} onAdd={addComponent} />
            ) : (
              <TreePanel dataObjects={dataObjects} onBindField={bindField} />
            )}
              </>
            ) : null}
          </aside>
        ) : null}

        {isSideToolbarCollapsed ? (
          <button
            aria-label="Show builder tools"
            className="redos-builder-toolbar-peek"
            data-redos-tooltip="Tampilkan toolbar builder"
            type="button"
            onClick={() => setIsSideToolbarCollapsed(false)}
          >
            ›
          </button>
        ) : (
          <BuilderSideToolbar
            device={device}
            isPreviewing={isPreviewing}
            target={target}
            onCollapse={() => setIsSideToolbarCollapsed(true)}
            onDeviceChange={setDevice}
            onPreviewToggle={previewExperience}
          />
        )}

        <Canvas
          applicationCode={applicationCode}
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
            applicationCode={applicationCode}
            components={components}
            dataObjects={dataObjects}
            metadataVersion={metadataVersion}
            selected={selected}
            theme={theme}
            onChange={updateSelected}
            onDelete={deleteSelected}
            onThemeChange={setTheme}
          />
        ) : null}
      </section>
      {saveConfirmationOpen ? (
        <BuilderConfirmModal
          confirmLabel="Save Metadata"
          kicker="Confirm Save"
          title="Save Current Screen?"
          onCancel={() => setSaveConfirmationOpen(false)}
          onConfirm={saveDraft}
        >
          Canvas draft, selected screen/form, mode, and screen registry for <strong>{applicationNameFromCode(applicationCode)}</strong> will be saved.
        </BuilderConfirmModal>
      ) : null}
    </main>
  );
}

function BuilderConfirmModal({
  children,
  confirmLabel,
  kicker,
  onCancel,
  onConfirm,
  title,
}: {
  children: ReactNode;
  confirmLabel: string;
  kicker: string;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
}) {
  return (
    <div className="redos-confirm-backdrop" role="presentation">
      <section className="redos-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="redos-builder-confirm-title">
        <div>
          <span className="redos-kicker">{kicker}</span>
          <h3 id="redos-builder-confirm-title">{title}</h3>
          <p>{children}</p>
        </div>
        <div className="redos-confirm-actions">
          <button type="button" onClick={onCancel}>Cancel</button>
          <button className="redos-primary-action" type="button" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </section>
    </div>
  );
}

function BuilderSideToolbar({
  device,
  isPreviewing,
  onCollapse,
  onDeviceChange,
  onPreviewToggle,
  target,
}: {
  device: StudioDevice;
  isPreviewing: boolean;
  onCollapse: () => void;
  onDeviceChange: (device: StudioDevice) => void;
  onPreviewToggle: () => void;
  target: StudioTarget;
}) {
  return (
    <aside className="redos-builder-side-toolbar" aria-label="Builder view controls">
      <button
        data-redos-tooltip="Auto-hide toolbar"
        type="button"
        onClick={onCollapse}
      >
        «
      </button>
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
  if (type.startsWith('Template')) {
    return ['TemplateBadge', 'TemplateAvatar'].includes(type) ? 3 : 12;
  }

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

  if (type.startsWith('Template')) {
    if (['TemplateBadge', 'TemplateAlert', 'TemplateAvatar', 'TemplateBreadcrumb', 'TemplateAppHeader'].includes(type)) {
      return 96;
    }

    if (['TemplateImageCard', 'TemplateVideoCard', 'TemplateDropzone', 'TemplateProfileCard', 'TemplateNotificationList'].includes(type)) {
      return 190;
    }

    if (['TemplateChartPanel', 'TemplateLineChart', 'TemplateBarChart', 'TemplateCalendarBoard', 'TemplateAuthForm'].includes(type)) {
      return 320;
    }

    return 240;
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

function builderDraftKey(target: StudioTarget, applicationCode: string, screenCode: string) {
  return `redios:studio:${applicationCode}:${screenCode}:${target}:draft`;
}

function resolvePublishedApplicationSlug(target: StudioTarget, applicationCode: string) {
  const [, root, route, appCode] = window.location.pathname.split('/');

  if (root === 'studio' && route === 'apps' && appCode) {
    return toApplicationSlug(appCode);
  }

  return target === 'android' ? `${toApplicationSlug(applicationCode)}-android` : toApplicationSlug(applicationCode);
}

function loadBuilderDraft(target: StudioTarget, applicationCode: string, screenCode: string): BuilderDraftState | undefined {
  try {
    const rawDraft = window.localStorage.getItem(builderDraftKey(target, applicationCode, screenCode));

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

function syncBuilderMetadataToDesigners({
  applicationCode,
  components,
  screenObjectName,
}: {
  applicationCode: string;
  components: CanvasComponent[];
  screenObjectName: string;
}) {
  const currentDataObjects = loadDataObjects(applicationCode);
  const currentActions = loadActions(applicationCode);
  const dataSync = syncDataMetadataFromComponents(components, currentDataObjects, screenObjectName);
  const actions = syncActionMetadataFromComponents(dataSync.components, currentActions);

  saveDataObjects(dataSync.dataObjects, applicationCode);
  saveActions(actions, applicationCode);

  return {
    actions,
    components: dataSync.components,
    dataObjects: dataSync.dataObjects,
  };
}

function syncDataMetadataFromComponents(
  components: CanvasComponent[],
  dataObjects: StudioDataObject[],
  screenObjectName: string,
): { components: CanvasComponent[]; dataObjects: StudioDataObject[] } {
  let nextDataObjects = [...dataObjects];
  const fallbackObjectName = objectNameFromFormComponents(components) || screenObjectName.trim();

  const nextComponents = mapComponents(components, (component) => {
    if (component.type.startsWith('Template') && fallbackObjectName && !component.template?.dataSource?.object) {
      return {
        ...component,
        template: {
          ...component.template,
          dataSource: {
            ...component.template?.dataSource,
            object: fallbackObjectName,
          },
        },
      };
    }

    if (!supportsDataMetadataSync(component.type)) {
      return component;
    }

    const objectName = component.binding?.object?.trim() || fallbackObjectName;

    if (!objectName) {
      return component;
    }

    const fieldName = component.binding?.field?.trim() || dataFieldNameFromComponent(component);

    if (!fieldName) {
      return component;
    }

    const attribute: StudioDataAttribute = {
      name: fieldName,
      type: attributeTypeFromComponent(component.type),
    };

    nextDataObjects = upsertDataAttribute(nextDataObjects, objectName, attribute);

    if (component.binding?.object === objectName && component.binding?.field === fieldName) {
      return component;
    }

    return {
      ...component,
      binding: {
        object: objectName,
        field: fieldName,
      },
    };
  });

  return {
    components: nextComponents,
    dataObjects: nextDataObjects,
  };
}

function objectNameFromFormComponents(components: CanvasComponent[]) {
  const form = flattenComponents(components).find((component) => component.type === 'Form');
  const label = form?.label.trim();

  if (!label) {
    return '';
  }

  return label.replace(/\s+form$/i, '').trim();
}

function syncActionMetadataFromComponents(components: CanvasComponent[], actions: StudioActionDraft[]) {
  const nextActions = [...actions];

  for (const component of flattenComponents(components)) {
    for (const [eventKey, actionLabel] of Object.entries(component.events ?? {})) {
      if (actionLabel) {
        upsertActionDraft(nextActions, actionLabel, eventKey as StudioActionDraft['trigger']);
      }
    }

    if (component.confirmation?.enabled && component.confirmation.onConfirmAction) {
      upsertActionDraft(nextActions, component.confirmation.onConfirmAction, component.type === 'Submit' ? 'onSubmit' : 'onClick');
    }
  }

  return nextActions;
}

function upsertDataAttribute(dataObjects: StudioDataObject[], objectName: string, attribute: StudioDataAttribute) {
  const objectIndex = dataObjects.findIndex((object) => object.name === objectName);

  if (objectIndex < 0) {
    return [{ name: objectName, attributes: [attribute] }, ...dataObjects];
  }

  return dataObjects.map((object, index) => {
    if (index !== objectIndex) {
      return object;
    }

    if (object.attributes.some((current) => current.name === attribute.name)) {
      return object;
    }

    return {
      ...object,
      attributes: [...object.attributes, attribute],
    };
  });
}

function upsertActionDraft(actions: StudioActionDraft[], actionLabelOrCode: string, trigger: StudioActionDraft['trigger']) {
  const cleanLabel = actionLabelOrCode.trim();

  if (!cleanLabel || cleanLabel === 'None') {
    return;
  }

  const code = toMetadataCode(cleanLabel);
  const existingAction = actions.find((action) => action.code === cleanLabel || action.label === cleanLabel || action.code === code);

  if (existingAction) {
    return;
  }

  actions.unshift({
    code,
    label: cleanLabel,
    trigger,
    steps: defaultActionSteps(cleanLabel),
  });
}

function defaultActionSteps(actionLabel: string) {
  const normalized = actionLabel.toLowerCase();

  if (['save', 'simpan', 'submit', 'create', 'add', 'buat'].some((keyword) => normalized.includes(keyword))) {
    return ['validate', 'save'];
  }

  return ['validate'];
}

function mapComponents(components: CanvasComponent[], mapper: (component: CanvasComponent) => CanvasComponent): CanvasComponent[] {
  return components.map((component) => {
    const mappedComponent = mapper(component);

    if (!mappedComponent.children?.length) {
      return mappedComponent;
    }

    return {
      ...mappedComponent,
      children: mapComponents(mappedComponent.children, mapper),
    };
  });
}

function dataFieldNameFromComponent(component: CanvasComponent) {
  return component.label.trim() || component.placeholder?.trim() || component.id;
}

function supportsDataMetadataSync(type: string) {
  return [
    'TextInput',
    'NumberInput',
    'Search',
    'EmailInput',
    'PhoneInput',
    'PasswordInput',
    'UrlInput',
    'LocationInput',
    'TextArea',
    'TextEditor',
    'Dropdown',
    'Lookup',
    'Checkbox',
    'SingleChoice',
    'MultipleChoice',
    'DecisionBox',
    'Tags',
    'ToggleSwitch',
    'DateInput',
    'TimeInput',
    'DateTimeInput',
    'UploadField',
    'ImageUpload',
    'MultiFileUpload',
    'MultiImageUpload',
    'TemplateCheckboxGroup',
    'TemplateDatePicker',
    'TemplateFileInput',
    'TemplateInputGroup',
    'TemplateInputState',
    'TemplatePhoneInputGroup',
    'TemplateRadioGroup',
    'TemplateSelectGroup',
    'TemplateSwitchGroup',
    'TemplateTextareaState',
  ].includes(type);
}

function attributeTypeFromComponent(type: string): StudioDataAttribute['type'] {
  if (type === 'NumberInput') {
    return 'number';
  }

  if (type === 'DateInput') {
    return 'date';
  }

  if (type === 'TemplateDatePicker') {
    return 'date';
  }

  if (type === 'TimeInput') {
    return 'time';
  }

  if (type === 'DateTimeInput') {
    return 'datetime';
  }

  if (type === 'EmailInput') {
    return 'email';
  }

  if (type === 'PhoneInput') {
    return 'phone';
  }

  if (type === 'TemplatePhoneInputGroup') {
    return 'phone';
  }

  if (type === 'UrlInput') {
    return 'url';
  }

  if (['TextArea', 'TextEditor', 'TemplateTextareaState'].includes(type)) {
    return 'longText';
  }

  if (type === 'Lookup') {
    return 'lookup';
  }

  if (['Checkbox', 'DecisionBox', 'ToggleSwitch', 'TemplateCheckboxGroup', 'TemplateSwitchGroup'].includes(type)) {
    return 'boolean';
  }

  if (['UploadField', 'MultiFileUpload', 'TemplateFileInput'].includes(type)) {
    return 'file';
  }

  if (['ImageUpload', 'MultiImageUpload'].includes(type)) {
    return 'image';
  }

  return 'text';
}

function collectPublishedScreenCanvases({
  activeComponents,
  activeScreenCode,
  applicationCode,
  dataObjects,
  screens,
  target,
}: {
  activeComponents: CanvasComponent[];
  activeScreenCode: string;
  applicationCode: string;
  dataObjects: StudioDataObject[];
  screens: StudioScreenDraft[];
  target: StudioTarget;
}) {
  return Object.fromEntries(screens.map((screen) => {
    if (screen.code === activeScreenCode) {
      return [screen.code, activeComponents];
    }

    const draft = loadBuilderDraft(target, applicationCode, screen.code);
    return [screen.code, draft?.components ?? componentsForObject(screen.objectName, dataObjects, screen.mode)];
  }));
}

function ensureApplicationScreens(screens: StudioScreenDraft[], dataObjects: StudioDataObject[], target: StudioTarget): StudioScreenDraft[] {
  if (screens.length > 0) {
    return screens;
  }

  const firstObject = dataObjects[0];

  return [
    {
      code: defaultScreenCode(firstObject?.name),
      label: firstObject ? `${firstObject.name} Form` : 'Unbound Screen',
      objectName: firstObject?.name,
      mode: 'create',
      target,
      updatedAt: new Date().toISOString(),
    },
  ];
}

function componentsForObject(
  objectName: string | undefined,
  dataObjects: StudioDataObject[],
  mode: StudioScreenDraft['mode'] = 'create',
): CanvasComponent[] {
  const object = dataObjects.find((item) => item.name === objectName) ?? dataObjects[0];

  if (!object) {
    return [];
  }

  if (mode === 'table' || mode === 'list') {
    return componentsForObjectView(object, mode);
  }

  return [
    {
      id: `${toApplicationSlug(object.name)}_${mode}_form`,
      type: 'Form',
      label: screenLabelForMode(object.name, mode),
      width: 12,
      height: 320,
      x: 0,
      y: 0,
      children: [
        ...object.attributes.map((attribute, index) => ({
          id: `${toApplicationSlug(object.name)}_${toApplicationSlug(attribute.name)}`,
          type: componentTypeForAttribute(attribute.type),
          label: attribute.name,
          placeholder: `Enter ${attribute.name}`,
          width: attribute.type === 'longText' || attribute.type === 'json' ? 12 : 6,
          height: attribute.type === 'longText' || attribute.type === 'json' ? 72 : 60,
          x: index % 2 === 0 ? 0 : 6,
          y: index,
          binding: { object: object.name, field: attribute.name },
        })),
        ...(mode === 'detail' ? [] : [{
          id: `${mode === 'edit' ? 'update' : 'save'}_${toApplicationSlug(object.name)}`,
          type: 'Button',
          label: `${mode === 'edit' ? 'Update' : 'Save'} ${object.name}`,
          width: 4,
          height: 56,
          x: 0,
          y: object.attributes.length,
          events: { onClick: `${mode === 'edit' ? 'Update' : 'Save'} ${object.name}` },
        }]),
      ],
    },
  ];
}

function componentsForObjectView(object: StudioDataObject, mode: Extract<StudioScreenDraft['mode'], 'table' | 'list'>): CanvasComponent[] {
  return [
    {
      id: `${toApplicationSlug(object.name)}_${mode}_heading`,
      type: 'FormHeading',
      label: screenLabelForMode(object.name, mode),
      width: 12,
      height: 64,
      x: 0,
      y: 0,
    },
    {
      id: `${toApplicationSlug(object.name)}_${mode}_search`,
      type: 'Search',
      label: `Search ${object.name}`,
      placeholder: `Search ${object.name}`,
      width: 12,
      height: 60,
      x: 0,
      y: 1,
      binding: {
        object: object.name,
        field: object.attributes[0]?.name ?? '',
      },
    },
    {
      id: `${toApplicationSlug(object.name)}_${mode}_table`,
      type: 'DataTable',
      label: `${object.name} ${mode === 'table' ? 'Table' : 'List'}`,
      width: 12,
      height: 260,
      x: 0,
      y: 2,
      binding: {
        object: object.name,
        field: object.attributes[0]?.name ?? '',
      },
    },
    {
      id: `create_${toApplicationSlug(object.name)}`,
      type: 'Button',
      label: `Create ${object.name}`,
      width: 4,
      height: 56,
      x: 0,
      y: 3,
      events: { onClick: `Open ${object.name} Create Form` },
    },
  ];
}

function componentTypeForAttribute(type: StudioDataObject['attributes'][number]['type']) {
  if (['number', 'integer', 'decimal', 'double', 'currency', 'percentage'].includes(type)) {
    return 'NumberInput';
  }

  if (type === 'date') {
    return 'DateInput';
  }

  if (type === 'time') {
    return 'TimeInput';
  }

  if (type === 'datetime') {
    return 'DateInput';
  }

  if (type === 'email') {
    return 'EmailInput';
  }

  if (type === 'password') {
    return 'PasswordInput';
  }

  if (type === 'phone') {
    return 'PhoneInput';
  }

  if (type === 'url') {
    return 'UrlInput';
  }

  if (type === 'boolean') {
    return 'Checkbox';
  }

  if (type === 'lookup') {
    return 'Lookup';
  }

  if (type === 'enum') {
    return 'Dropdown';
  }

  if (type === 'file') {
    return 'UploadField';
  }

  if (type === 'image') {
    return 'ImageUpload';
  }

  if (type === 'longText' || type === 'json') {
    return 'TextArea';
  }

  return 'TextInput';
}

function screenModeLabel(mode: StudioScreenDraft['mode'] = 'create') {
  const labels: Record<StudioScreenDraft['mode'], string> = {
    create: 'Create Form',
    edit: 'Edit Form',
    detail: 'Detail View',
    table: 'Table View',
    list: 'List View',
  };

  return labels[mode];
}

function nextCreatableScreenMode(
  screens: StudioScreenDraft[],
  objectName: string | undefined,
  target: StudioTarget,
  preferredMode: StudioScreenDraft['mode'],
) {
  const modeOrder: StudioScreenDraft['mode'][] = ['create', 'edit', 'detail', 'table', 'list'];
  const orderedModes = [preferredMode, ...modeOrder.filter((mode) => mode !== preferredMode)];

  return orderedModes.find((mode) => !screens.some((screen) => screen.objectName === objectName && screen.mode === mode && screen.target === target))
    ?? preferredMode;
}

function screenLabelForMode(objectName: string | undefined, mode: StudioScreenDraft['mode'] = 'create') {
  const objectLabel = objectName?.trim() || 'Unbound';
  return `${objectLabel} ${screenModeLabel(mode)}`;
}

function screenOptionLabel(screen: StudioScreenDraft | undefined) {
  if (!screen) {
    return '';
  }

  const modeLabel = screenModeLabel(screen.mode);
  return screen.label.toLowerCase().includes(modeLabel.toLowerCase()) ? screen.label : `${screen.label} · ${modeLabel}`;
}

function modeScreenCode(objectName: string | undefined, mode: StudioScreenDraft['mode']) {
  const objectCode = objectName ? toApplicationSlug(objectName) : 'unbound';
  return `${objectCode}-${mode}-screen`;
}

function defaultScreenCode(objectName?: string) {
  return objectName ? `${toApplicationSlug(objectName)}-screen` : 'unbound-screen';
}

function uniqueScreenCode(baseCode: string, screens: StudioScreenDraft[]) {
  if (!screens.some((screen) => screen.code === baseCode)) {
    return baseCode;
  }

  let index = 2;
  let nextCode = `${baseCode}-${index}`;

  while (screens.some((screen) => screen.code === nextCode)) {
    index += 1;
    nextCode = `${baseCode}-${index}`;
  }

  return nextCode;
}

function applicationNameFromCode(value: string) {
  return value.toLowerCase().split('_').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function collectBuilderThemeTokens() {
  const tokens: Record<string, string> = {};
  const styles = window.getComputedStyle(document.documentElement);

  for (const name of Array.from(styles)) {
    if (name.startsWith('--redos-builder-')) {
      const value = styles.getPropertyValue(name).trim();

      if (value) {
        tokens[name] = value;
      }
    }
  }

  return tokens;
}

function formatSavedAt(value: string) {
  return new Intl.DateTimeFormat('en', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}
