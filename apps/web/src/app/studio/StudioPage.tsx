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
import { FormBuilder } from '../../builder/form/FormBuilder';
import { IntegrationBuilder } from '../../builder/integration/IntegrationBuilder';
import { PageBuilder } from '../../builder/ui/PageBuilder';
import { WorkflowBuilder } from '../../builder/workflow/WorkflowBuilder';
import { Panel } from '../../components/atomic/organisms/Organisms';
import { DesignerClient, type DesignerPreviewResult } from '../../core/api/designer-client';
import { MetadataClient, type MetadataDebugTree } from '../../core/api/metadata-client';
import { createRediOSClient } from '../../core/api/redios-client';
import { RuntimeClient } from '../../core/api/runtime-client';
import { useRuntimeContext } from '../../core/context/runtime-context';
import type { ResolvedUIPage, RuntimeForm, RuntimeNavigation, RuntimeTheme } from '../../core/renderer/runtime-types';
import { ThemeProvider } from '../../core/theme/theme-provider';
import { StudioHome } from '../../studio/dashboard/StudioHome';
import type { ExplorerSelection } from '../../studio/explorer/ApplicationExplorer';
import { HelpPanel } from '../../studio/help/HelpPanel';
import { StudioHeader } from '../../studio/StudioHeader';
import { StudioPreview } from '../../studio/preview/StudioPreview';
import { RuntimeHealthView } from '../../studio/runtime/RuntimeHealthView';
import { StudioSidebar } from '../../studio/StudioSidebar';
import { StudioShell } from '../../studio/StudioShell';
import { StudioWorkspace } from '../../studio/StudioWorkspace';
import { TemplateGallery } from '../../studio/templates/TemplateGallery';
import { GuidedAppBuilder } from '../../studio/wizard/GuidedAppBuilder';

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
    return <main className="runtime-card">Loading RediOS Studio...</main>;
  }

  return (
    <ThemeProvider theme={state.theme}>
      <StudioShell
        header={
          <StudioHeader
            context={context}
            themeCode={state.theme.theme}
            navigationCode={state.navigation.navigation}
            canSimulate={Boolean(form?.entityCode)}
            onSimulate={() => void runSimulation(runtimeClient, context, form?.entityCode)}
          />
        }
        sidebar={
          <StudioSidebar
            navigation={state.navigation}
            tree={state.tree}
            selection={selection}
            onSelect={setSelection}
          />
        }
      >
        {error ? <div className="studio-error">{error}</div> : null}
        <StudioWorkspace>
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
            onSelect={setSelection}
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
  onSelect: (selection: ExplorerSelection) => void;
  onPreview: (preview: DesignerPreviewResult) => void;
  onPublished: () => void;
}) {
  if (!selection) {
    return <Panel title="Studio Workspace">Select metadata from the explorer.</Panel>;
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

  if (selection.type === 'WIZARD') {
    return (
      <>
        <GuidedAppBuilder />
        <HelpPanel topic="HOME" />
      </>
    );
  }

  if (selection.type === 'TEMPLATES') {
    return <TemplateGallery />;
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
    return (
      <>
        <FormBuilder form={form} entity={entity} designer={designerClient} onPreview={onPreview} onPublished={onPublished} />
        <StudioPreview preview={preview} form={form} />
        <HelpPanel topic="FORMS" />
      </>
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

  return (
    <Panel title="Metadata">
      <div className="studio-muted">Selected metadata is loaded from the Metadata Engine.</div>
      <pre>{JSON.stringify(selection, null, 2)}</pre>
    </Panel>
  );
}

function initialSelection(tree: MetadataDebugTree): ExplorerSelection | undefined {
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

async function resolveForm(
  selection: ExplorerSelection,
  tree: MetadataDebugTree,
  metadataClient: MetadataClient,
): Promise<RuntimeForm | undefined> {
  if (selection.type === 'ENTITY') {
    return metadataClient.getForm(selection.code);
  }

  if (selection.type === 'FORMS') {
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
