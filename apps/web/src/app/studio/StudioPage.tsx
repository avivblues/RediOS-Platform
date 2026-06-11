import { useEffect, useMemo, useState } from 'react';
import type {
  ApplicationDefinition,
  ConnectorDefinition,
  EntityDefinition,
  IntegrationDefinition,
  MetadataDefinition,
  RuntimePackageDefinition,
  WorkflowDefinition,
} from '@redios/shared';
import { IntegrationBuilder } from '../../builder/integration/IntegrationBuilder';
import { PageBuilder } from '../../builder/ui/PageBuilder';
import { WorkflowBuilder } from '../../builder/workflow/WorkflowBuilder';
import { Button } from '../../components/atomic/atoms/Atoms';
import { Panel } from '../../components/atomic/organisms/Organisms';
import { DesignerClient, type DesignerPreviewResult } from '../../core/api/designer-client';
import { MetadataClient, type MetadataDebugTree } from '../../core/api/metadata-client';
import { createRediOSClient } from '../../core/api/redios-client';
import { RuntimeClient } from '../../core/api/runtime-client';
import { useRuntimeContext } from '../../core/context/runtime-context';
import type { ResolvedUIPage, RuntimeForm, RuntimeNavigation, RuntimeTheme } from '../../core/renderer/runtime-types';
import { ThemeProvider } from '../../core/theme/theme-provider';
import { ApplicationBuilderView } from '../../studio/application/ApplicationBuilderView';
import { FormBuilderPage } from '../../studio/builder/FormBuilderPage';
import { StudioCommandCenter } from '../../studio/command/StudioCommandCenter';
import { StudioHome } from '../../studio/dashboard/StudioHome';
import { CreationWizard } from '../../studio/create/CreationWizard';
import { ErrorState } from '../../studio/error/ErrorState';
import type { ExplorerSelection } from '../../studio/explorer/ApplicationExplorer';
import { HelpPanel } from '../../studio/help/HelpPanel';
import { StudioHistoryPanel } from '../../studio/history/StudioHistoryPanel';
import { readStudioMode, type StudioMode, writeStudioMode } from '../../studio/mode/studio-mode';
import { StudioHeader } from '../../studio/StudioHeader';
import { StudioPreview } from '../../studio/preview/StudioPreview';
import { RuntimeHealthView } from '../../studio/runtime/RuntimeHealthView';
import { StudioSidebar } from '../../studio/StudioSidebar';
import { StudioShell } from '../../studio/StudioShell';
import { StudioWorkspace } from '../../studio/StudioWorkspace';
import { TemplateGallery } from '../../studio/templates/TemplateGallery';

interface StudioState {
  theme: RuntimeTheme;
  navigation: RuntimeNavigation;
  tree: MetadataDebugTree;
  applications: Array<MetadataDefinition<ApplicationDefinition>>;
  entities: EntityDefinition[];
  runtimePackage?: MetadataDefinition<RuntimePackageDefinition> | null;
}

export function StudioPage() {
  const { context } = useRuntimeContext();
  const redios = useMemo(() => createRediOSClient(context), [context]);
  const metadataClient = redios.metadata;
  const designerClient = redios.designer;
  const runtimeClient = redios.runtime;
  const [state, setState] = useState<StudioState | undefined>();
  const [selection, setSelection] = useState<ExplorerSelection | undefined>();
  const [form, setForm] = useState<RuntimeForm | undefined>();
  const [entity, setEntity] = useState<EntityDefinition | undefined>();
  const [page, setPage] = useState<ResolvedUIPage | undefined>();
  const [workflow, setWorkflow] = useState<MetadataDefinition<WorkflowDefinition> | undefined>();
  const [integration, setIntegration] = useState<MetadataDefinition<IntegrationDefinition> | undefined>();
  const [connector, setConnector] = useState<MetadataDefinition<ConnectorDefinition> | undefined>();
  const [preview, setPreview] = useState<DesignerPreviewResult | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [reloadKey, setReloadKey] = useState(0);
  const [mode, setMode] = useState<StudioMode>(() => readStudioMode());

  useEffect(() => {
    let mounted = true;

    async function loadStudio() {
      try {
        const [theme, navigation, tree] = await Promise.all([
          metadataClient.getTheme(),
          metadataClient.getNavigation(),
          metadataClient.getMetadataTree(),
        ]);
        const [applications, entities, runtimePackage] = await Promise.all([
          Promise.all(tree.applications.map((code) => metadataClient.getMetadata<ApplicationDefinition>('APPLICATION', code).catch(() => undefined))),
          Promise.all(tree.entities.map((code) => metadataClient.getMetadata<EntityDefinition>('ENTITY', code).then((metadata) => metadata.definition).catch(() => undefined))),
          metadataClient.getRuntimePackage().catch(() => null),
        ]);

        if (!mounted) {
          return;
        }

        setState({
          theme,
          navigation,
          tree,
          applications: applications.filter((metadata): metadata is MetadataDefinition<ApplicationDefinition> => Boolean(metadata)),
          entities: entities.filter((metadata): metadata is EntityDefinition => Boolean(metadata)),
          runtimePackage,
        });
        setSelection(current => current ?? initialSelection(tree));
      } catch (loadError) {
        if (mounted) {
          setError(loadError instanceof Error ? loadError.message : String(loadError));
        }
      }
    }

    void loadStudio();

    return () => {
      mounted = false;
    };
  }, [metadataClient, reloadKey]);

  useEffect(() => {
    if (!selection || !state) {
      return;
    }

    const activeSelection = selection;
    const activeState = state;
    let mounted = true;

    async function loadSelection() {
      setPreview(undefined);
      setError(undefined);

      try {
        const nextForm = await resolveForm(activeSelection, activeState.tree, metadataClient);
        const nextEntity = await resolveEntity(activeSelection, nextForm, metadataClient);
        const nextPage = await resolvePage(activeSelection, metadataClient);
        const nextWorkflow = await resolveWorkflow(activeSelection, metadataClient);
        const nextIntegration = await resolveIntegration(activeSelection, metadataClient);
        const nextConnector = await resolveConnector(activeSelection, metadataClient);

        if (!mounted) {
          return;
        }

        setForm(nextForm);
        setEntity(nextEntity);
        setPage(nextPage);
        setWorkflow(nextWorkflow);
        setIntegration(nextIntegration);
        setConnector(nextConnector);
      } catch (selectionError) {
        if (mounted) {
          setError(selectionError instanceof Error ? selectionError.message : String(selectionError));
        }
      }
    }

    void loadSelection();

    return () => {
      mounted = false;
    };
  }, [metadataClient, selection, state]);

  if (!state) {
    return (
      <main className="runtime-card">
        {error ? <ErrorState message={error} onRetry={() => setReloadKey((current) => current + 1)} /> : 'Loading RediOS Studio...'}
      </main>
    );
  }

  const activeApplicationCode = selectedApplicationCode(selection, context.applicationCode);

  function handleSelect(nextSelection: ExplorerSelection) {
    setSelection(nextSelection);

    if (nextSelection.type === 'APPLICATION_BUILDER') {
      window.history.pushState(null, '', `/studio/apps/${nextSelection.code}`);
      return;
    }

    if (nextSelection.type === 'CREATE_APPLICATION') {
      window.history.pushState(null, '', '/studio/create');
      return;
    }

    if (nextSelection.type === 'FORM_BUILDER') {
      window.history.pushState(null, '', `/studio/builder/forms/${nextSelection.code}`);
      return;
    }

    if (window.location.pathname !== '/studio') {
      window.history.pushState(null, '', '/studio');
    }
  }

  function handleModeChange(nextMode: StudioMode) {
    setMode(nextMode);
    writeStudioMode(nextMode);
  }

  if (selection?.type === 'FORM_BUILDER') {
    return (
      <ThemeProvider theme={state.theme}>
        {error ? <ErrorState message={error} onRetry={() => setReloadKey((current) => current + 1)} /> : null}
        <FormBuilderPage
          form={form}
          entity={entity}
          designer={designerClient}
          context={context}
          applicationName={state.applications[0]?.definition.name ?? context.applicationCode}
          developerMode={mode === 'EXPERT'}
          onPreview={setPreview}
          onPublished={() => setReloadKey((current) => current + 1)}
          onBack={() => handleSelect({ type: 'HOME', code: 'HOME' })}
        />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={state.theme}>
      <StudioShell
        header={
          <StudioHeader
            context={context}
            themeCode={state.theme.theme}
            applications={state.applications}
            selectedApplicationCode={activeApplicationCode}
            mode={mode}
            onApplicationSelect={(applicationCode) => handleSelect({ type: 'APPLICATION_BUILDER', code: applicationCode })}
            onModeChange={handleModeChange}
            canSimulate={Boolean(form?.entityCode)}
            onSimulate={() => void runSimulation(runtimeClient, context, form?.entityCode)}
          />
        }
        sidebar={
          <StudioSidebar
            tree={state.tree}
            selection={selection}
            mode={mode}
            onSelect={handleSelect}
          />
        }
      >
        {error ? <ErrorState message={error} onRetry={() => setReloadKey((current) => current + 1)} /> : null}
        <StudioWorkspace>
          <StudioCommandCenter tree={state.tree} mode={mode} onSelect={handleSelect} />
          <ActiveWorkspace
            selection={selection}
            tree={state.tree}
            applications={state.applications}
            entities={state.entities}
            runtimePackage={state.runtimePackage}
            form={form}
            entity={entity}
            page={page}
            workflow={workflow}
            integration={integration}
            connector={connector}
            metadataClient={metadataClient}
            designerClient={designerClient}
            runtimeClient={runtimeClient}
            context={context}
            preview={preview}
            mode={mode}
            onSelect={handleSelect}
            onPreview={setPreview}
            onPublished={() => setReloadKey((current) => current + 1)}
          />
        </StudioWorkspace>
      </StudioShell>
    </ThemeProvider>
  );
}

function ActiveWorkspace({
  selection,
  tree,
  applications,
  entities,
  runtimePackage,
  form,
  entity,
  page,
  workflow,
  integration,
  connector,
  metadataClient,
  designerClient,
  runtimeClient,
  context,
  preview,
  mode,
  onSelect,
  onPreview,
  onPublished,
}: {
  selection?: ExplorerSelection;
  tree: MetadataDebugTree;
  applications: Array<MetadataDefinition<ApplicationDefinition>>;
  entities: EntityDefinition[];
  runtimePackage?: MetadataDefinition<RuntimePackageDefinition> | null;
  form?: RuntimeForm;
  entity?: EntityDefinition;
  page?: ResolvedUIPage;
  workflow?: MetadataDefinition<WorkflowDefinition>;
  integration?: MetadataDefinition<IntegrationDefinition>;
  connector?: MetadataDefinition<ConnectorDefinition>;
  metadataClient: MetadataClient;
  designerClient: DesignerClient;
  runtimeClient: RuntimeClient;
  context: ReturnType<typeof useRuntimeContext>['context'];
  preview?: DesignerPreviewResult;
  mode: StudioMode;
  onSelect: (selection: ExplorerSelection) => void;
  onPreview: (preview: DesignerPreviewResult) => void;
  onPublished: () => void;
}) {
  if (!selection) {
    return <Panel title="Studio Workspace">Pilih bagian Studio untuk mulai membangun aplikasi.</Panel>;
  }

  if (selection.type === 'HOME') {
    return (
      <>
        <StudioHome
          tree={tree}
          applications={applications}
          entities={entities}
          runtimeStatus={runtimePackage?.definition.status}
          onSelect={onSelect}
        />
        <HelpPanel topic="HOME" />
      </>
    );
  }

  if (selection.type === 'APPLICATION_BUILDER') {
    const application = applications.find((metadata) => metadata.definition.code === selection.code) ?? applications[0];

    if (!application) {
      return <Panel title="Application Builder">Belum ada aplikasi yang tersedia.</Panel>;
    }

    return (
      <>
        <ApplicationBuilderView application={application} entities={entities} tree={tree} onSelect={onSelect} />
        <StudioHistoryPanel designer={designerClient} onRestored={onPublished} />
        <HelpPanel topic="APPLICATION" />
      </>
    );
  }

  if (selection.type === 'CREATE_APPLICATION') {
    return (
      <>
        <CreationWizard designer={designerClient} context={context} expertMode={mode === 'EXPERT'} />
        <HelpPanel topic="HOME" />
      </>
    );
  }

  if (selection.type === 'TEMPLATES') {
    return <TemplateGallery onCreateFromTemplate={() => onSelect({ type: 'CREATE_APPLICATION', code: 'CREATE_APPLICATION' })} />;
  }

  if (selection.type === 'RUNTIME' || selection.type === 'HEALTH') {
    return (
      <>
        <RuntimeHealthView runtimePackage={runtimePackage} />
        <HelpPanel topic="RUNTIME" />
      </>
    );
  }

  if (selection.type === 'ENTITY' || selection.type === 'FORMS') {
    const screenCode = form?.form ?? selection.code;
    return (
      <Panel title="Open Full Page Builder">
        <p className="studio-muted">Screen sekarang dibuka di full browser workspace agar field, component, canvas, preview, dan action binding terlihat jelas.</p>
        <Button onClick={() => onSelect({ type: 'FORM_BUILDER', code: screenCode })} tooltip="Buka visual builder full page.">
          Open Visual Builder
        </Button>
      </Panel>
    );
  }

  if (selection.type === 'FORM_BUILDER') {
    return (
      <FormBuilderPage
        form={form}
        entity={entity}
        designer={designerClient}
        context={context}
        applicationName={applications[0]?.definition.name ?? context.applicationCode}
        developerMode={mode === 'EXPERT'}
        onPreview={onPreview}
        onPublished={onPublished}
        onBack={() => onSelect({ type: 'HOME', code: 'HOME' })}
      />
    );
  }

  if (selection.type === 'PAGES') {
    return <PageBuilder page={page} />;
  }

  if (selection.type === 'WORKFLOWS') {
    return (
      <>
        <WorkflowBuilder metadata={workflow} designer={designerClient} runtime={runtimeClient} context={context} onPreview={onPreview} />
        <StudioPreview preview={preview} />
        <HelpPanel topic="WORKFLOWS" />
      </>
    );
  }

  if (selection.type === 'INTEGRATIONS' || selection.type === 'CONNECTORS') {
    return (
      <>
        <IntegrationBuilder
          tree={tree}
          selectedIntegration={integration}
          selectedConnector={connector}
          metadata={metadataClient}
          designer={designerClient}
          runtime={runtimeClient}
          onPreview={onPreview}
        />
        <StudioPreview preview={preview} />
        <HelpPanel topic="INTEGRATIONS" />
      </>
    );
  }

  if (selection.type === 'METADATA_EXPLORER' && mode === 'EXPERT') {
    return (
      <Panel title="Metadata Explorer">
        <div className="studio-muted">Expert tools expose raw metadata categories for debugging.</div>
        <pre>{JSON.stringify(tree, null, 2)}</pre>
      </Panel>
    );
  }

  return (
    <Panel title="Studio Tool">
      <div className="studio-muted">{mode === 'EXPERT' ? 'This Studio area is available from metadata and will use the existing engine APIs when opened.' : 'Area Studio ini akan terbuka saat sudah tersedia untuk aplikasi.'}</div>
      {mode === 'EXPERT' ? <pre>{JSON.stringify(selection, null, 2)}</pre> : null}
    </Panel>
  );
}

function initialSelection(tree: MetadataDebugTree): ExplorerSelection | undefined {
  const [, route, resource, applicationCode] = window.location.pathname.split('/');

  if (route === 'studio' && resource === 'create') {
    return { type: 'CREATE_APPLICATION', code: 'CREATE_APPLICATION' };
  }

  if (route === 'studio' && resource === 'apps' && applicationCode) {
    return { type: 'APPLICATION_BUILDER', code: applicationCode };
  }

  if (route === 'studio' && resource === 'builder') {
    const [, , , builderKind, screenId] = window.location.pathname.split('/');

    if (builderKind === 'forms' && screenId) {
      return { type: 'FORM_BUILDER', code: screenId };
    }
  }

  if (tree.applications.length > 0 || tree.forms.length > 0 || tree.entities.length > 0) {
    return { type: 'HOME', code: 'HOME' };
  }

  if (tree.forms[0]) {
    return { type: 'FORMS', code: tree.forms[0] };
  }

  if (tree.entities[0]) {
    return { type: 'ENTITY', code: tree.entities[0] };
  }

  return undefined;
}

function selectedApplicationCode(selection: ExplorerSelection | undefined, fallback: string): string {
  return selection?.type === 'APPLICATION_BUILDER' ? selection.code : fallback;
}

async function resolveForm(
  selection: ExplorerSelection,
  tree: MetadataDebugTree,
  metadataClient: MetadataClient,
): Promise<RuntimeForm | undefined> {
  if (selection.type === 'ENTITY') {
    return metadataClient.getForm(selection.code).catch(() => undefined);
  }

  if (selection.type === 'FORMS' || selection.type === 'FORM_BUILDER') {
    for (const entityCode of tree.entities) {
      const candidate = await metadataClient.getForm(entityCode).catch(() => undefined);

      if (candidate?.form === selection.code) {
        return candidate;
      }
    }
  }

  return undefined;
}

async function resolveEntity(
  selection: ExplorerSelection,
  form: RuntimeForm | undefined,
  metadataClient: MetadataClient,
): Promise<EntityDefinition | undefined> {
  const entityCode = selection.type === 'ENTITY' ? selection.code : form?.entityCode;

  if (!entityCode) {
    return undefined;
  }

  return metadataClient.getMetadata<EntityDefinition>('ENTITY', entityCode).then((metadata) => metadata.definition).catch(() => undefined);
}

async function resolvePage(selection: ExplorerSelection, metadataClient: MetadataClient): Promise<ResolvedUIPage | undefined> {
  if (selection.type === 'PAGES') {
    return metadataClient.getPage(selection.code).catch(() => undefined);
  }

  return undefined;
}

async function resolveWorkflow(
  selection: ExplorerSelection,
  metadataClient: MetadataClient,
): Promise<MetadataDefinition<WorkflowDefinition> | undefined> {
  if (selection.type === 'WORKFLOWS') {
    return metadataClient.getMetadata<WorkflowDefinition>('WORKFLOW', selection.code).catch(() => undefined);
  }

  return undefined;
}

async function resolveIntegration(
  selection: ExplorerSelection,
  metadataClient: MetadataClient,
): Promise<MetadataDefinition<IntegrationDefinition> | undefined> {
  if (selection.type === 'INTEGRATIONS') {
    return metadataClient.getMetadata<IntegrationDefinition>('INTEGRATION', selection.code).catch(() => undefined);
  }

  return undefined;
}

async function resolveConnector(
  selection: ExplorerSelection,
  metadataClient: MetadataClient,
): Promise<MetadataDefinition<ConnectorDefinition> | undefined> {
  if (selection.type === 'CONNECTORS') {
    return metadataClient.getMetadata<ConnectorDefinition>('CONNECTOR', selection.code).catch(() => undefined);
  }

  return undefined;
}

async function runSimulation(runtimeClient: RuntimeClient, context: ReturnType<typeof useRuntimeContext>['context'], entityCode?: string) {
  if (!entityCode) {
    return;
  }

  await runtimeClient.simulate({
    tenantId: context.tenantId,
    domainCode: context.domainCode,
    applicationCode: context.applicationCode,
    entityCode,
    actionCode: 'READ',
    permissions: context.permissions,
    roles: context.roles,
    platform: 'WEB',
  });
}
