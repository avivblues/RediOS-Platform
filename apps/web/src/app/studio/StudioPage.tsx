import { useEffect, useMemo, useState } from 'react';
import type { ConnectorDefinition, IntegrationDefinition, MetadataDefinition, WorkflowDefinition } from '@redios/shared';
import { EntityBuilder } from '../../builder/entity/EntityBuilder';
import { FormBuilder } from '../../builder/form/FormBuilder';
import { IntegrationBuilder } from '../../builder/integration/IntegrationBuilder';
import { WorkflowBuilder } from '../../builder/workflow/WorkflowBuilder';
import { Button } from '../../components/atomic/atoms/Atoms';
import { StudioLayout } from '../../components/atomic/templates/StudioLayout';
import { createApiClient } from '../../core/api/api-client';
import { DesignerClient, type DesignerPreviewResult } from '../../core/api/designer-client';
import { MetadataClient, type MetadataDebugTree } from '../../core/api/metadata-client';
import { RuntimeClient } from '../../core/api/runtime-client';
import { useRuntimeContext } from '../../core/context/runtime-context';
import type { ResolvedUIPage, RuntimeForm, RuntimeNavigation, RuntimeTheme } from '../../core/renderer/runtime-types';
import { ThemeProvider } from '../../core/theme/theme-provider';
import { ApplicationExplorer, type ExplorerSelection } from '../../studio/explorer/ApplicationExplorer';
import { StudioPreview } from '../../studio/preview/StudioPreview';

interface StudioState {
  theme: RuntimeTheme;
  navigation: RuntimeNavigation;
  tree: MetadataDebugTree;
}

export function StudioPage() {
  const { context } = useRuntimeContext();
  const api = useMemo(() => createApiClient(context), [context]);
  const metadataClient = useMemo(() => new MetadataClient(api), [api]);
  const designerClient = useMemo(() => new DesignerClient(api), [api]);
  const runtimeClient = useMemo(() => new RuntimeClient(api), [api]);
  const [state, setState] = useState<StudioState | undefined>();
  const [selection, setSelection] = useState<ExplorerSelection | undefined>();
  const [form, setForm] = useState<RuntimeForm | undefined>();
  const [page, setPage] = useState<ResolvedUIPage | undefined>();
  const [workflow, setWorkflow] = useState<MetadataDefinition<WorkflowDefinition> | undefined>();
  const [integration, setIntegration] = useState<MetadataDefinition<IntegrationDefinition> | undefined>();
  const [connector, setConnector] = useState<MetadataDefinition<ConnectorDefinition> | undefined>();
  const [preview, setPreview] = useState<DesignerPreviewResult | undefined>();
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    let mounted = true;

    async function loadStudio() {
      try {
        const [theme, navigation, tree] = await Promise.all([
          metadataClient.getTheme(),
          metadataClient.getNavigation(),
          metadataClient.getMetadataTree(),
        ]);

        if (!mounted) {
          return;
        }

        setState({ theme, navigation, tree });
        setSelection({ type: 'ENTITY', code: tree.entities[0] ?? '' });
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
  }, [metadataClient]);

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
        const nextPage = await resolvePage(activeSelection, metadataClient);
        const nextWorkflow = await resolveWorkflow(activeSelection, metadataClient);
        const nextIntegration = await resolveIntegration(activeSelection, metadataClient);
        const nextConnector = await resolveConnector(activeSelection, metadataClient);

        if (!mounted) {
          return;
        }

        setForm(nextForm);
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
      <StudioLayout
        header={
          <div className="studio-section-header">
            <div>
              <h1>RediOS Studio</h1>
              <div className="studio-muted">Metadata editor | Theme: {state.theme.theme} | Navigation: {state.navigation.navigation}</div>
            </div>
            <Button variant="secondary" onClick={() => void runSimulation(runtimeClient, context, form?.entityCode)}>
              Simulate
            </Button>
          </div>
        }
        sidebar={<ApplicationExplorer tree={state.tree} selection={selection} onSelect={setSelection} />}
      >
        {error ? <div className="studio-error">{error}</div> : null}
        <div className="studio-workspace-grid">
          <EntityBuilder entityCode={form?.entityCode ?? selection?.code} form={form} designer={designerClient} onPreview={setPreview} />
          <FormBuilder form={form} designer={designerClient} onPreview={setPreview} />
        </div>
        <WorkflowBuilder metadata={workflow} designer={designerClient} runtime={runtimeClient} context={context} onPreview={setPreview} />
        <IntegrationBuilder
          tree={state.tree}
          selectedIntegration={integration}
          selectedConnector={connector}
          metadata={metadataClient}
          designer={designerClient}
          runtime={runtimeClient}
          onPreview={setPreview}
        />
        <StudioPreview preview={preview} form={form} page={page} />
      </StudioLayout>
    </ThemeProvider>
  );
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
