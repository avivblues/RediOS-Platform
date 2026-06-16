import { type CSSProperties, type ReactNode, useEffect, useMemo, useState } from 'react';
import { ThemeProvider } from '../core/theme/theme-provider';
import { createMetadataClient } from '../core/metadata-client/metadata-client';
import { useRuntimeContext } from '../core/context/runtime-context';
import type { ResolvedUIPage, RuntimeForm, RuntimeNavigation, RuntimeTheme } from '../core/renderer/runtime-types';
import { humanizeCode } from '../studio_legacy_phase19/humanizer/HumanizerEngine';
import { RuntimeNavigationRenderer } from './RuntimeNavigationRenderer';
import { RuntimePageRenderer } from './RuntimePageRenderer';
import { loadPublishedApplication, type StudioApplicationMetadataPackage } from '../studio/metadata/metadata-store';
import type { CanvasComponent } from '../studio/builder/types';
import {
  RediosCard,
  RediosDashboardShell,
  RediosDashboardSidebar,
  RediosDashboardTopbar,
  RediosDataTable,
  RediosModal,
  RediosPageHero,
  RediosStatusPills,
  type RediosDataColumn,
  type RediosNavGroup,
} from '../components/redios-ui/DashboardKit';
import { isTailAdminTemplateComponent, RediosTemplateComponent } from '../components/redios-template/TemplateComponents';
import { useAuth } from '../auth/context/AuthProvider';
import { IdentityEngine, REDIOS_ADMIN_APP_CODE } from '../identity/identity-engine';
import { loadRuntimeRecords, saveRuntimeRecords } from './runtime-record-store';

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

export function RuntimeAppShell({ applicationCode, initialScreenCode }: { applicationCode: string; initialScreenCode?: string }) {
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
    return <PublishedMetadataRuntime application={publishedApplication} initialScreenCode={initialScreenCode} />;
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

function PublishedMetadataRuntime({
  application,
  initialScreenCode,
}: {
  application: StudioApplicationMetadataPackage;
  initialScreenCode?: string;
}) {
  const firstMenu = application.menu.find((item) => item.parent) ?? application.menu.find((item) => !item.parent) ?? application.menu[0];
  const [activeMenuId, setActiveMenuId] = useState(firstMenu?.id ?? '');
  const [overrideScreenCode, setOverrideScreenCode] = useState(initialScreenCode);
  const [status, setStatus] = useState('Ready');
  const { context, updateContext } = useRuntimeContext();
  const auth = useAuth();
  const identityEngine = useMemo(() => new IdentityEngine(), []);
  const activeMenu = application.menu.find((item) => item.id === activeMenuId) ?? firstMenu;
  const activeScreenCode = overrideScreenCode ?? activeMenu?.screen ?? application.screens[0]?.code ?? '';
  const activeScreen = application.screens.find((screen) => screen.code === activeScreenCode);
  const activeCanvas = enhanceCanvasWithMetadataFields(application, activeScreen, application.screenCanvases?.[activeScreenCode] ?? application.canvas);
  const [document, setDocument] = useState<Record<string, string>>(() => initialDocumentFromCanvas(activeCanvas));
  const [pendingConfirmation, setPendingConfirmation] = useState<PendingRuntimeConfirmation>();
  const primaryObject = objectNameFromCanvas(activeCanvas) ?? activeScreen?.objectName ?? application.dataObjects[0]?.name ?? 'Record';
  const records = loadRuntimeRecords(application.appSlug, primaryObject);
  const rootMenus = application.menu.filter((item) => !item.parent || !application.menu.some((candidate) => candidate.id === item.parent));
  const navGroups = runtimeNavGroups(application, rootMenus, activeMenuId, (menuId) => {
    setOverrideScreenCode(undefined);
    setActiveMenuId(menuId);
  });
  const recordColumns = runtimeRecordColumns(application, primaryObject, records);
  const dashboardMetrics = runtimeDashboardMetrics(application, primaryObject, records.length);
  const dashboardBars = runtimeDashboardBars(application, records.length);
  const dashboardActivity = runtimeDashboardActivity(application, activeScreen?.label ?? activeScreenCode, activeMenu?.label ?? 'Home', primaryObject);

  useEffect(() => {
    const currentRecord = activeScreen?.mode === 'edit' || activeScreen?.mode === 'detail'
      ? loadRuntimeRecords(application.appSlug, primaryObject)[0]
      : undefined;
    setDocument(initialDocumentFromCanvas(activeCanvas, currentRecord));
    setStatus(activeScreen ? `Screen ${activeScreen.label} loaded` : 'Generated screen loaded');
  }, [activeScreenCode]);

  useEffect(() => {
    if (application.appCode === REDIOS_ADMIN_APP_CODE) {
      identityEngine.ensureSeedData();
    }
  }, [application.appCode, identityEngine]);

  function updateField(component: CanvasComponent, value: string) {
    const fieldKey = component.binding ? `${component.binding.object}.${component.binding.field}` : component.id;
    setDocument((current) => ({ ...current, [fieldKey]: value }));
  }

  function executeAction(actionLabelOrCode?: string) {
    if (actionLabelOrCode?.startsWith('OPEN.')) {
      setOverrideScreenCode(actionLabelOrCode.replace('OPEN.', ''));
      setStatus(`Screen ${actionLabelOrCode.replace('OPEN.', '')} opened from metadata action.`);
      return;
    }

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

    if (application.appCode === REDIOS_ADMIN_APP_CODE) {
      try {
        const result = identityEngine.executeCapability(action.code, nextRecord, context);

        if (action.code === 'AUTH.LOGIN' && result && typeof result === 'object' && 'userId' in result) {
          const session = result as { permissions: string[]; roles: string[]; userId: string };
          updateContext({
            applicationCode: REDIOS_ADMIN_APP_CODE,
            permissions: session.permissions,
            roles: session.roles,
            userId: session.userId,
          });
          setOverrideScreenCode(undefined);
          setStatus('Login success. Session created and permission loaded.');
          window.history.pushState({}, '', '/apps/redios-admin');
          return;
        }

        if (result) {
          setDocument(initialDocumentFromCanvas(activeCanvas));
          setStatus(`${action.label} executed through IdentityEngine metadata runtime.`);
          return;
        }
      } catch (identityError) {
        setStatus(identityError instanceof Error ? identityError.message : String(identityError));
        return;
      }
    }

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
    <RediosDashboardShell
      autoHideSidebar
      sidebar={(
        <RediosDashboardSidebar
          brandSubtitle="Published App"
          brandTitle={application.appName}
          groups={navGroups}
        />
      )}
      topbar={(
        <RediosDashboardTopbar
          context={`${application.appName} / ${activeMenu?.label ?? 'Home'} / ${activeScreen?.label ?? activeScreenCode}`}
          onLogout={() => {
            auth.logout();
            updateContext({
              permissions: [],
              roles: [],
              userId: 'anonymous',
            });
            window.location.href = '/login';
          }}
          onProfile={() => { window.location.href = '/profile'; }}
          status={status}
          title={auth.session?.displayName ?? context.userId}
        />
      )}
    >
      <RediosPageHero
        breadcrumbs={[application.appName, activeMenu?.label ?? 'Home', activeScreen?.label ?? activeScreenCode]}
        title={activeScreen?.label ?? activeMenu?.label ?? application.appName}
        subtitle={`${activeMenu?.permission ?? 'runtime.access'} · ${activeScreen?.mode ?? 'runtime'} · published ${formatRuntimeDate(application.publishedAt)}`}
      >
        <RediosStatusPills
          items={[
            'Metadata Header',
            'Sidebar Menu',
            `Object: ${primaryObject}`,
            `Screen: ${activeScreen?.mode ?? 'runtime'}`,
            'Permission Guard',
          ]}
        />
      </RediosPageHero>

      <RediosCard
        eyebrow="Dummy Dashboard"
        title={`${application.appName} Overview`}
        description="Template dashboard sementara untuk melihat bentuk published app. Angkanya diambil dari metadata dan runtime demo storage."
      >
        <div className="redios-dashboard-metrics">
          {dashboardMetrics.map((metric) => (
            <article key={metric.label} className="redios-dashboard-metric-card">
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <small>{metric.hint}</small>
            </article>
          ))}
        </div>
        <div className="redios-dashboard-insight-grid">
          <section className="redios-dashboard-chart" aria-label="Metadata coverage chart">
            <div className="redios-dashboard-card-header">
              <span className="redios-dashboard-eyebrow">Metadata Coverage</span>
              <h3>Runtime Readiness</h3>
              <p>Dummy chart dari jumlah metadata yang dipublish.</p>
            </div>
            <div className="redios-dashboard-bars">
              {dashboardBars.map((bar) => (
                <div key={bar.label} className="redios-dashboard-bar-row">
                  <span>{bar.label}</span>
                  <div aria-hidden="true">
                    <i style={{ width: `${bar.percent}%` }} />
                  </div>
                  <strong>{bar.value}</strong>
                </div>
              ))}
            </div>
          </section>
          <section className="redios-dashboard-activity" aria-label="Runtime activity">
            <div className="redios-dashboard-card-header">
              <span className="redios-dashboard-eyebrow">Runtime Activity</span>
              <h3>Latest Signals</h3>
              <p>Status dummy yang mengikuti screen aktif.</p>
            </div>
            <div className="redios-dashboard-feed">
              {dashboardActivity.map((activity) => (
                <article key={activity.title}>
                  <span>{activity.time}</span>
                  <strong>{activity.title}</strong>
                  <small>{activity.description}</small>
                </article>
              ))}
            </div>
          </section>
        </div>
      </RediosCard>

      <RediosCard
        eyebrow="UI Metadata"
        title={activeScreen?.label ?? activeMenu?.screen ?? 'Generated Screen'}
        description={status}
      >
        <div className="redos-runtime-canvas">
          {activeCanvas.map((component) => (
            <PublishedComponent
              key={component.id}
              application={application}
                columns={recordColumns}
              component={component}
              document={document}
              appSlug={application.appSlug}
                records={records}
              onChange={updateField}
              onAction={executeAction}
              onConfirmAction={setPendingConfirmation}
            />
          ))}
        </div>
      </RediosCard>

      <RediosCard
        eyebrow="Runtime Data"
        title={`${primaryObject} records`}
        description="Universal runtime storage for demo persistence."
      >
        <RediosDataTable columns={recordColumns} emptyText="No saved data yet." rows={records} />
      </RediosCard>

      {pendingConfirmation ? (
        <RediosModal
          cancelLabel={pendingConfirmation.cancelLabel}
          confirmLabel={pendingConfirmation.confirmLabel}
          title={pendingConfirmation.title}
          onCancel={() => setPendingConfirmation(undefined)}
          onConfirm={() => {
            const action = pendingConfirmation.action;
            setPendingConfirmation(undefined);
            executeAction(action);
          }}
        >
          <p>{pendingConfirmation.message}</p>
        </RediosModal>
      ) : null}
    </RediosDashboardShell>
  );
}

function runtimeNavGroups(
  application: StudioApplicationMetadataPackage,
  rootMenus: StudioApplicationMetadataPackage['menu'],
  activeMenuId: string,
  selectMenu: (menuId: string) => void,
): RediosNavGroup[] {
  return rootMenus.map((menu) => {
    const children = application.menu.filter((child) => child.parent === menu.id);
    const childItems = children.map((child) => ({
      id: child.id,
      label: child.label,
      active: activeMenuId === child.id,
      meta: child.permission,
      onSelect: () => selectMenu(child.id),
    }));

    return {
      id: menu.id,
      label: menu.label,
      active: activeMenuId === menu.id || childItems.some((child) => child.active),
      items: childItems,
      onSelect: () => selectMenu(menu.id),
    };
  });
}

function runtimeRecordColumns(
  application: StudioApplicationMetadataPackage,
  objectName: string,
  records: Array<Record<string, unknown>>,
): RediosDataColumn[] {
  const object = application.dataObjects.find((item) => item.name === objectName);
  const attributeColumns = object?.attributes
    .filter((attribute) => !attribute.hidden && !attribute.secure)
    .map((attribute) => ({
      key: attribute.name,
      label: attribute.label ?? humanizeCode(attribute.name),
    })) ?? [];
  const fallbackColumns = Array.from(new Set(records.flatMap((record) => Object.keys(record))))
    .filter((key) => key !== 'id')
    .map((key) => ({
      key,
      label: humanizeCode(key),
    }));
  const columns = attributeColumns.length > 0 ? attributeColumns : fallbackColumns;

  return [{ key: 'id', label: 'ID' }, ...columns].slice(0, 8);
}

function runtimeDashboardMetrics(
  application: StudioApplicationMetadataPackage,
  primaryObject: string,
  recordCount: number,
) {
  return [
    {
      label: 'Runtime Records',
      value: String(recordCount),
      hint: `${primaryObject} demo storage`,
    },
    {
      label: 'Data Objects',
      value: String(application.dataObjects.length),
      hint: 'From Data Designer',
    },
    {
      label: 'Actions',
      value: String(application.actions.length),
      hint: 'Bound to buttons/events',
    },
    {
      label: 'Screens',
      value: String(application.screens.length),
      hint: 'Published screen registry',
    },
  ];
}

function runtimeDashboardBars(application: StudioApplicationMetadataPackage, recordCount: number) {
  const bars = [
    { label: 'Data', value: application.dataObjects.length },
    { label: 'Screens', value: application.screens.length },
    { label: 'Actions', value: application.actions.length },
    { label: 'Connectors', value: application.connectors.length },
    { label: 'Records', value: recordCount },
  ];
  const maxValue = Math.max(...bars.map((bar) => bar.value), 1);

  return bars.map((bar) => ({
    ...bar,
    percent: Math.max(8, Math.round((bar.value / maxValue) * 100)),
  }));
}

function runtimeDashboardActivity(
  application: StudioApplicationMetadataPackage,
  activeScreenLabel: string,
  activeMenuLabel: string,
  primaryObject: string,
) {
  return [
    {
      time: 'Now',
      title: `${activeScreenLabel} loaded`,
      description: `Screen dibuka lewat menu ${activeMenuLabel}.`,
    },
    {
      time: 'Metadata',
      title: `${primaryObject} capability ready`,
      description: `${application.dataObjects.length} data object tersedia untuk runtime.`,
    },
    {
      time: 'Publish',
      title: `${application.appName} package active`,
      description: `${application.actions.length} action dan ${application.connectors.length} connector ikut dipublish.`,
    },
  ];
}

function enhanceCanvasWithMetadataFields(
  application: StudioApplicationMetadataPackage,
  activeScreen: StudioApplicationMetadataPackage['screens'][number] | undefined,
  components: CanvasComponent[],
) {
  if (!activeScreen?.objectName || ['table', 'list'].includes(activeScreen.mode) || ['LOGIN_FORM', 'REGISTER_FORM'].includes(activeScreen.code)) {
    return components;
  }

  const object = application.dataObjects.find((item) => item.name === activeScreen.objectName);

  if (!object) {
    return components;
  }

  const boundFields = new Set(flattenCanvasComponents(components)
    .map((component) => component.binding ? `${component.binding.object}.${component.binding.field}` : '')
    .filter(Boolean));
  const extensionFields = object.attributes.filter((attribute) => {
    return !attribute.locked
      && !attribute.systemField
      && !attribute.hidden
      && !attribute.secure
      && !boundFields.has(`${object.name}.${attribute.name}`);
  });

  if (extensionFields.length === 0) {
    return components;
  }

  let injected = false;

  return components.map((component) => {
    if (injected || component.type !== 'Form') {
      return component;
    }

    injected = true;
    const children = component.children ?? [];
    const startY = children.reduce((maxY, child) => Math.max(maxY, Number(child.y) || 0), 0) + 1;
    const extensionComponents = extensionFields.map((attribute, index) => ({
      id: `${slug(object.name)}_${slug(attribute.name)}_metadata_extension`,
      type: componentTypeForRuntimeAttribute(attribute.type),
      label: attribute.label ?? attribute.name,
      placeholder: `Enter ${attribute.label ?? attribute.name}`,
      readonly: activeScreen.mode === 'detail' || attribute.editable === false,
      width: attribute.type === 'longText' || attribute.type === 'json' ? 12 : 6,
      height: attribute.type === 'longText' || attribute.type === 'json' ? 76 : 64,
      x: index % 2 === 0 ? 0 : 6,
      y: startY + index,
      binding: { object: object.name, field: attribute.name },
    }));

    return {
      ...component,
      height: component.height + Math.ceil(extensionComponents.length / 2) * 76,
      children: [...children, ...extensionComponents],
    };
  });
}

function componentTypeForRuntimeAttribute(type: StudioApplicationMetadataPackage['dataObjects'][number]['attributes'][number]['type']) {
  if (['number', 'integer', 'decimal', 'double', 'currency', 'percentage'].includes(type)) {
    return 'NumberInput';
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

  if (type === 'date' || type === 'datetime') {
    return 'DateInput';
  }

  if (type === 'time') {
    return 'TimeInput';
  }

  if (type === 'enum' || type === 'lookup') {
    return 'Dropdown';
  }

  if (type === 'longText' || type === 'json') {
    return 'TextArea';
  }

  return 'TextInput';
}

function slug(value: string) {
  return value.trim().replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'field';
}

function PublishedComponent({
  application,
  appSlug,
  columns,
  component,
  document,
  records,
  onChange,
  onAction,
  onConfirmAction,
}: {
  application: StudioApplicationMetadataPackage;
  appSlug: string;
  columns?: RediosDataColumn[];
  component: CanvasComponent;
  document: Record<string, string>;
  records?: Array<Record<string, unknown>>;
  onChange: (component: CanvasComponent, value: string) => void;
  onAction: (actionLabelOrCode?: string) => void;
  onConfirmAction: (confirmation: PendingRuntimeConfirmation) => void;
}) {
  if (isTailAdminTemplateComponent(component.type)) {
    const templateObjectName = component.template?.dataSource?.object;
    const object = templateObjectName ? application.dataObjects.find((item) => item.name === templateObjectName) : undefined;
    const templateRecords = templateObjectName ? loadRuntimeRecords(appSlug, templateObjectName) : records;
    const templateColumns = object?.attributes.map((attribute) => ({
      key: attribute.name,
      label: humanizeCode(attribute.name),
    })) ?? columns;
    const fieldKey = component.binding ? `${component.binding.object}.${component.binding.field}` : component.id;

    return (
      <PublishedComponentFrame component={component}>
        <RediosTemplateComponent
          component={component}
          context={{
            columns: templateColumns?.map((column) => ({ key: column.key, label: column.label })),
            onAction,
            onValueChange: (value) => onChange(component, value),
            records: templateRecords,
            value: document[fieldKey] ?? '',
          }}
          mode="runtime"
        />
      </PublishedComponentFrame>
    );
  }

  if (component.type === 'Form') {
    return (
      <section className="redos-form-container-preview" style={publishedComponentStyle(component)}>
        <header>{component.label}</header>
        <div className="redos-form-container-body">
          {component.children?.map((child) => (
            <PublishedComponent key={child.id} application={application} appSlug={appSlug} columns={columns} component={child} document={document} records={records} onChange={onChange} onAction={onAction} onConfirmAction={onConfirmAction} />
          ))}
        </div>
      </section>
    );
  }

  if (component.type === 'DataTable') {
    const tableObjectName = component.template?.dataSource?.object ?? component.binding?.object;
    const object = tableObjectName ? application.dataObjects.find((item) => item.name === tableObjectName) : undefined;
    const tableRecords = tableObjectName ? loadRuntimeRecords(appSlug, tableObjectName) : records ?? [];
    const tableColumns = component.template?.columns?.length
      ? component.template.columns.map((column) => ({ key: column.field, label: column.label }))
      : object?.attributes
        .filter((attribute) => !attribute.hidden && !attribute.secure)
        .map((attribute) => ({ key: attribute.name, label: attribute.label ?? humanizeCode(attribute.name) })) ?? columns ?? [];

    return (
      <PublishedComponentFrame component={component}>
        <RediosDataTable columns={tableColumns} emptyText="No runtime records yet." rows={tableRecords} />
      </PublishedComponentFrame>
    );
  }

  if (component.type === 'Button' || component.type === 'Submit') {
    const action = component.confirmation?.enabled
      ? component.confirmation.onConfirmAction
      : component.events?.onClick ?? component.events?.onSubmit;

    return (
      <PublishedComponentFrame component={component}>
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
      </PublishedComponentFrame>
    );
  }

  if (isInputComponent(component.type)) {
    const fieldKey = component.binding ? `${component.binding.object}.${component.binding.field}` : component.id;
    return (
      <PublishedComponentFrame component={component}>
        <label className="redos-runtime-field">
        <span>{component.label}</span>
        <input
          inputMode={component.type === 'NumberInput' ? 'decimal' : undefined}
          placeholder={component.placeholder}
          readOnly={component.readonly}
          type={component.type === 'NumberInput' ? 'number' : component.type === 'PasswordInput' ? 'password' : 'text'}
          value={document[fieldKey] ?? ''}
          onChange={(event) => onChange(component, event.target.value)}
        />
        </label>
      </PublishedComponentFrame>
    );
  }

  if (component.type === 'TextArea' || component.type === 'TextEditor') {
    const fieldKey = component.binding ? `${component.binding.object}.${component.binding.field}` : component.id;
    return (
      <PublishedComponentFrame component={component}>
        <label className="redos-runtime-field">
        <span>{component.label}</span>
        <textarea
          placeholder={component.placeholder}
          readOnly={component.readonly}
          value={document[fieldKey] ?? ''}
          onChange={(event) => onChange(component, event.target.value)}
        />
        </label>
      </PublishedComponentFrame>
    );
  }

  return (
    <PublishedComponentFrame component={component}>
      <div className="redos-runtime-static">
        <strong>{component.label || component.type}</strong>
      </div>
    </PublishedComponentFrame>
  );
}

function PublishedComponentFrame({ children, component }: { children: ReactNode; component: CanvasComponent }) {
  return (
    <div className="redos-published-component" style={publishedComponentStyle(component)}>
      {children}
    </div>
  );
}

function publishedComponentStyle(component: CanvasComponent): CSSProperties {
  const width = Math.max(1, Math.min(Number(component.width) || 12, 12));
  const x = Math.max(0, Math.min(Number(component.x) || 0, 12 - width));

  return {
    gridColumn: `${x + 1} / span ${width}`,
    minHeight: component.height || undefined,
  };
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

function initialDocumentFromCanvas(components: CanvasComponent[], record?: Record<string, unknown>) {
  return Object.fromEntries(flattenCanvasComponents(components)
    .filter((component) => component.binding)
    .map((component) => {
      const fieldName = component.binding?.field ?? '';
      return [`${component.binding?.object}.${fieldName}`, formatDocumentValue(record?.[fieldName])];
    }));
}

function formatDocumentValue(value: unknown) {
  if (value === null || value === undefined) {
    return '';
  }

  return typeof value === 'object' ? JSON.stringify(value) : String(value);
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

function formatRuntimeDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}
