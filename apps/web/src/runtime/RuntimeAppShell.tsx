import { useEffect, useMemo, useState } from 'react';
import { ThemeProvider } from '../core/theme/theme-provider';
import { createMetadataClient } from '../core/metadata-client/metadata-client';
import { useRuntimeContext } from '../core/context/runtime-context';
import type { ResolvedUIPage, RuntimeForm, RuntimeNavigation, RuntimeTheme } from '../core/renderer/runtime-types';
import { humanizeCode } from '../studio_legacy_phase19/humanizer/HumanizerEngine';
import { RuntimeNavigationRenderer } from './RuntimeNavigationRenderer';
import { RuntimePageRenderer } from './RuntimePageRenderer';
import { loadPublishedApplication, type StudioApplicationMetadataPackage } from '../studio/metadata/metadata-store';
import type { CanvasComponent } from '../studio/builder/types';

interface RuntimeAppState {
  theme: RuntimeTheme;
  navigation: RuntimeNavigation;
  page?: ResolvedUIPage;
  form?: RuntimeForm;
  activePageCode?: string;
}

interface PendingRuntimeConfirmation {
  action?: string;
  cancelLabel: string;
  confirmLabel: string;
  message: string;
  title: string;
}

export function RuntimeAppShell({ applicationCode }: { applicationCode: string }) {
  const publishedApplication = loadPublishedApplication(applicationCode);
  const { context } = useRuntimeContext();
  const runtimeContext = useMemo(() => ({ ...context, applicationCode }), [applicationCode, context]);
  const client = useMemo(() => createMetadataClient(runtimeContext), [runtimeContext]);
  const [state, setState] = useState<RuntimeAppState | undefined>();
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    let mounted = true;

    async function loadApplication() {
      setError(undefined);

      try {
        const [theme, navigation] = await Promise.all([client.getTheme(), client.getNavigation()]);
        const firstPageCode = firstNavigationPage(navigation);
        const page = firstPageCode ? await client.getPage(firstPageCode) : undefined;
        const form = page?.page.entityCode ? await client.getForm(page.page.entityCode) : undefined;

        if (!mounted) {
          return;
        }

        setState({
          theme,
          navigation,
          page,
          form,
          activePageCode: firstPageCode,
        });
      } catch (loadError) {
        if (mounted) {
          setError(loadError instanceof Error ? loadError.message : String(loadError));
        }
      }
    }

    void loadApplication();

    return () => {
      mounted = false;
    };
  }, [client]);

  if (publishedApplication) {
    return <PublishedMetadataRuntime application={publishedApplication} />;
  }

  async function selectPage(pageCode: string) {
    if (!state) {
      return;
    }

    const page = await client.getPage(pageCode);
    const form = page.page.entityCode ? await client.getForm(page.page.entityCode) : undefined;
    setState({
      ...state,
      page,
      form,
      activePageCode: pageCode,
    });
  }

  if (error) {
    return (
      <main className="runtime-card">
        <h1>Unable to load application runtime</h1>
        <p>{error}</p>
      </main>
    );
  }

  if (!state) {
    return <main className="runtime-card">Loading {humanizeCode(applicationCode)} runtime metadata...</main>;
  }

  return (
    <ThemeProvider theme={state.theme}>
      <div className="runtime-shell runtime-app-shell" data-navigation={state.navigation.layout}>
        <RuntimeNavigationRenderer
          applicationCode={applicationCode}
          navigation={state.navigation}
          activePageCode={state.activePageCode}
          onSelectPage={(pageCode) => void selectPage(pageCode)}
        />
        <main className="runtime-main runtime-app-main">
          <header className="runtime-card runtime-app-header">
            <span className="studio-kicker">Runtime Application</span>
            <h1>{humanizeCode(applicationCode)}</h1>
            <p>Generated from active metadata package.</p>
          </header>
          <RuntimePageRenderer
            page={state.page}
            form={state.form}
            theme={state.theme}
            navigation={state.navigation}
            renderContext={{
              client,
              rendererContext: {
                tenantId: runtimeContext.tenantId,
                domainCode: runtimeContext.domainCode,
                applicationCode,
                userId: runtimeContext.userId,
                roles: runtimeContext.roles,
                groups: runtimeContext.groups,
                attributes: runtimeContext.attributes,
                platform: 'WEB',
              },
            }}
          />
        </main>
      </div>
    </ThemeProvider>
  );
}

function PublishedMetadataRuntime({ application }: { application: StudioApplicationMetadataPackage }) {
  const firstMenu = application.menu.find((item) => item.parent) ?? application.menu.find((item) => !item.parent) ?? application.menu[0];
  const [activeMenuId, setActiveMenuId] = useState(firstMenu?.id ?? '');
  const [status, setStatus] = useState('Ready');
  const activeMenu = application.menu.find((item) => item.id === activeMenuId) ?? firstMenu;
  const activeScreenCode = activeMenu?.screen ?? application.screens[0]?.code ?? '';
  const activeScreen = application.screens.find((screen) => screen.code === activeScreenCode);
  const activeCanvas = application.screenCanvases?.[activeScreenCode] ?? application.canvas;
  const [document, setDocument] = useState<Record<string, string>>(() => initialDocumentFromCanvas(activeCanvas));
  const [pendingConfirmation, setPendingConfirmation] = useState<PendingRuntimeConfirmation>();
  const primaryObject = objectNameFromCanvas(activeCanvas) ?? activeScreen?.objectName ?? application.dataObjects[0]?.name ?? 'Record';
  const records = loadRuntimeRecords(application.appSlug, primaryObject);
  const rootMenus = application.menu.filter((item) => !item.parent || !application.menu.some((candidate) => candidate.id === item.parent));

  useEffect(() => {
    setDocument(initialDocumentFromCanvas(activeCanvas));
    setStatus(activeScreen ? `Screen ${activeScreen.label} loaded` : 'Generated screen loaded');
  }, [activeScreenCode]);

  function updateField(component: CanvasComponent, value: string) {
    const fieldKey = component.binding ? `${component.binding.object}.${component.binding.field}` : component.id;
    setDocument((current) => ({ ...current, [fieldKey]: value }));
  }

  function executeAction(actionLabelOrCode?: string) {
    const action = application.actions.find((item) => item.code === actionLabelOrCode || item.label === actionLabelOrCode);

    if (!action) {
      setStatus('No action metadata bound to this button');
      return;
    }

    const objectName = objectNameFromCanvas(activeCanvas) ?? activeScreen?.objectName ?? application.dataObjects[0]?.name;

    if (!objectName) {
      setStatus('No Data Object metadata found');
      return;
    }

    const nextRecord = Object.fromEntries(
      Object.entries(document)
        .filter(([key]) => key.startsWith(`${objectName}.`))
        .map(([key, value]) => [key.replace(`${objectName}.`, ''), value]),
    );

    if (action.steps.includes('save')) {
      const savedRecords = loadRuntimeRecords(application.appSlug, objectName);
      saveRuntimeRecords(application.appSlug, objectName, [
        { id: `${objectName}_${Date.now()}`, ...nextRecord },
        ...savedRecords,
      ]);
      const connectorMessages = connectorExecutionMessages(action.steps, application.connectors);
      setStatus([`${action.label} executed. ${objectName} saved.`, ...connectorMessages].join(' '));
      return;
    }

    setStatus([`${action.label} executed.`, ...connectorExecutionMessages(action.steps, application.connectors)].join(' '));
  }

  return (
    <div className="runtime-shell runtime-app-shell" data-navigation="SIDEBAR">
      <aside className="runtime-navigation runtime-sidebar">
        <div className="runtime-nav-brand">
          <span className="studio-kicker">Published App</span>
          <strong>{application.appName}</strong>
        </div>
        <nav className="runtime-nav-list" aria-label="Application menu">
          {rootMenus.map((item) => (
            <div key={item.id} className="runtime-nav-group">
              <button
                className={activeMenuId === item.id ? 'runtime-nav-active' : ''}
                type="button"
                onClick={() => setActiveMenuId(item.id)}
              >
                {item.label}
              </button>
              {application.menu.filter((child) => child.parent === item.id).map((child) => (
                <button
                  key={child.id}
                  className={activeMenuId === child.id ? 'runtime-nav-active' : ''}
                  type="button"
                  onClick={() => setActiveMenuId(child.id)}
                >
                  {child.label}
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>
      <main className="runtime-main runtime-app-main">
        <header className="runtime-card runtime-app-header">
          <span className="studio-kicker">Runtime Application</span>
          <h1>{activeScreen?.label ?? activeMenu?.label ?? application.appName}</h1>
          <p>{application.appName} · {activeMenu?.permission ?? 'runtime.access'} · {activeScreen?.mode ?? 'runtime'} · published {formatRuntimeDate(application.publishedAt)}</p>
          <div className="redos-metadata-pills">
            <span>Header</span>
            <span>Sidebar Menu</span>
            <span>Breadcrumb: {application.appName} / {activeMenu?.label ?? 'Home'} / {activeScreen?.label ?? activeScreenCode}</span>
            <span>User Profile</span>
            <span>Notification</span>
            <span>Permission Guard</span>
          </div>
        </header>

        <section className="runtime-card">
          <div className="redos-panel-heading">
            <span className="redos-kicker">UI Metadata</span>
            <h3>{activeScreen?.label ?? activeMenu?.screen ?? 'Generated Screen'}</h3>
            <p>{status}</p>
          </div>
          <div className="redos-runtime-canvas">
            {activeCanvas.map((component) => (
              <PublishedComponent
                key={component.id}
                component={component}
                document={document}
                onChange={updateField}
                onAction={executeAction}
                onConfirmAction={setPendingConfirmation}
              />
            ))}
          </div>
        </section>

        <section className="runtime-card">
          <div className="redos-panel-heading">
            <span className="redos-kicker">Runtime Data</span>
            <h3>{primaryObject} records</h3>
            <p>Universal runtime storage for demo persistence.</p>
          </div>
          {records.length === 0 ? (
            <p className="redos-muted">No saved data yet.</p>
          ) : (
            <div className="runtime-record-list">
              {records.map((record) => (
                <pre key={String(record.id)}>{JSON.stringify(record, null, 2)}</pre>
              ))}
            </div>
          )}
        </section>
        {pendingConfirmation ? (
          <div className="redos-confirm-backdrop" role="presentation">
            <section className="redos-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="redos-runtime-confirm-title">
              <div>
                <span className="redos-kicker">Confirm Action</span>
                <h3 id="redos-runtime-confirm-title">{pendingConfirmation.title}</h3>
                <p>{pendingConfirmation.message}</p>
              </div>
              <div className="redos-confirm-actions">
                <button type="button" onClick={() => setPendingConfirmation(undefined)}>{pendingConfirmation.cancelLabel}</button>
                <button
                  className="redos-primary-action"
                  type="button"
                  onClick={() => {
                    const action = pendingConfirmation.action;
                    setPendingConfirmation(undefined);
                    executeAction(action);
                  }}
                >
                  {pendingConfirmation.confirmLabel}
                </button>
              </div>
            </section>
          </div>
        ) : null}
      </main>
    </div>
  );
}

function PublishedComponent({
  component,
  document,
  onChange,
  onAction,
  onConfirmAction,
}: {
  component: CanvasComponent;
  document: Record<string, string>;
  onChange: (component: CanvasComponent, value: string) => void;
  onAction: (actionLabelOrCode?: string) => void;
  onConfirmAction: (confirmation: PendingRuntimeConfirmation) => void;
}) {
  if (component.type === 'Form') {
    return (
      <section className="redos-form-container-preview">
        <header>{component.label}</header>
        <div className="redos-form-container-body">
          {component.children?.map((child) => (
            <PublishedComponent key={child.id} component={child} document={document} onChange={onChange} onAction={onAction} onConfirmAction={onConfirmAction} />
          ))}
        </div>
      </section>
    );
  }

  if (component.type === 'Button' || component.type === 'Submit') {
    const action = component.confirmation?.enabled
      ? component.confirmation.onConfirmAction
      : component.events?.onClick ?? component.events?.onSubmit;

    return (
      <button
        className="redos-button-preview"
        type="button"
        onClick={() => {
          if (component.confirmation?.enabled) {
            onConfirmAction({
              action,
              cancelLabel: component.confirmation.cancelLabel,
              confirmLabel: component.confirmation.confirmLabel,
              message: component.confirmation.message,
              title: component.confirmation.title,
            });
            return;
          }

          onAction(action);
        }}
      >
        {component.label || 'Run Action'}
      </button>
    );
  }

  if (isInputComponent(component.type)) {
    const fieldKey = component.binding ? `${component.binding.object}.${component.binding.field}` : component.id;
    return (
      <label className="redos-runtime-field">
        <span>{component.label}</span>
        <input
          inputMode={component.type === 'NumberInput' ? 'decimal' : undefined}
          placeholder={component.placeholder}
          type={component.type === 'NumberInput' ? 'number' : component.type === 'PasswordInput' ? 'password' : 'text'}
          value={document[fieldKey] ?? ''}
          onChange={(event) => onChange(component, event.target.value)}
        />
      </label>
    );
  }

  if (component.type === 'TextArea' || component.type === 'TextEditor') {
    const fieldKey = component.binding ? `${component.binding.object}.${component.binding.field}` : component.id;
    return (
      <label className="redos-runtime-field">
        <span>{component.label}</span>
        <textarea
          placeholder={component.placeholder}
          value={document[fieldKey] ?? ''}
          onChange={(event) => onChange(component, event.target.value)}
        />
      </label>
    );
  }

  return (
    <div className="redos-runtime-static">
      <strong>{component.label || component.type}</strong>
    </div>
  );
}

function firstNavigationPage(navigation: RuntimeNavigation): string | undefined {
  const queue = [...navigation.items];

  while (queue.length > 0) {
    const item = queue.shift();

    if (!item) {
      continue;
    }

    const pageCode = item.page ?? (item.target.type === 'PAGE' ? item.target.code : undefined);

    if (pageCode) {
      return pageCode;
    }

    queue.push(...item.children);
  }

  return undefined;
}

function initialDocumentFromCanvas(components: CanvasComponent[]) {
  return Object.fromEntries(flattenCanvasComponents(components)
    .filter((component) => component.binding)
    .map((component) => [`${component.binding?.object}.${component.binding?.field}`, '']));
}

function objectNameFromCanvas(components: CanvasComponent[]) {
  return flattenCanvasComponents(components).find((component) => component.binding)?.binding?.object;
}

function flattenCanvasComponents(components: CanvasComponent[]): CanvasComponent[] {
  return components.flatMap((component) => [component, ...flattenCanvasComponents(component.children ?? [])]);
}

function isInputComponent(type: string) {
  return [
    'TextInput',
    'EmailInput',
    'PasswordInput',
    'PhoneInput',
    'NumberInput',
    'DateInput',
    'TimeInput',
    'Search',
    'Dropdown',
    'Tags',
  ].includes(type);
}

function connectorExecutionMessages(
  steps: string[],
  connectors: StudioApplicationMetadataPackage['connectors'],
) {
  return steps.flatMap((step) => {
    const connectorCode = step.match(/^call\s+(.+)$/i)?.[1]?.trim();

    if (!connectorCode) {
      return [];
    }

    const connector = connectors.find((item) => item.code === connectorCode);

    if (!connector) {
      return [`Connector ${connectorCode} not found.`];
    }

    return [`Connector ${connector.label} prepared (${connector.method} ${connector.url}).`];
  });
}

function runtimeRecordsKey(appSlug: string, objectName: string) {
  return `redios:runtime:${appSlug}:${objectName}:records`;
}

function loadRuntimeRecords(appSlug: string, objectName: string): Array<Record<string, unknown>> {
  try {
    const rawValue = window.localStorage.getItem(runtimeRecordsKey(appSlug, objectName));

    if (!rawValue) {
      return [];
    }

    const value = JSON.parse(rawValue);

    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function saveRuntimeRecords(appSlug: string, objectName: string, records: Array<Record<string, unknown>>) {
  window.localStorage.setItem(runtimeRecordsKey(appSlug, objectName), JSON.stringify(records));
}

function formatRuntimeDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}
