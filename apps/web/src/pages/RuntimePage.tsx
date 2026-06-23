import { useEffect, useMemo, useState } from 'react';
import { createDocumentState, resolveExperienceForRuntime } from '@redios/runtime-renderer-core';
import { createMetadataClient } from '../core/metadata-client/metadata-client';
import type {
  ResolvedUIPage,
  RuntimeDocumentState,
  RuntimeExperience,
  RuntimeForm,
  RuntimeNavigation,
  RuntimeTheme,
} from '../core/renderer/runtime-types';
import { RuntimeRenderer } from '../core/renderer/runtime-renderer';
import { ThemeProvider } from '../core/theme/theme-provider';
import { useRuntimeContext } from '../core/context/runtime-context';
import { NavigationRenderer } from '../components/organisms/navigation/NavigationRenderer';
import { ExperienceRuntimeShell } from '../core/experience/ExperienceRuntimeShell';

interface RuntimePageState {
  page: ResolvedUIPage;
  experience?: RuntimeExperience;
  form?: RuntimeForm;
  theme: RuntimeTheme;
  navigation: RuntimeNavigation;
}

export function RuntimePage() {
  const runtimeCode = runtimeCodeFromLocation(window.location.pathname);
  const { context } = useRuntimeContext();
  const client = useMemo(() => createMetadataClient(context), [context]);
  const [state, setState] = useState<RuntimePageState | undefined>();
  const [document, setDocument] = useState<RuntimeDocumentState>({ data: {} });
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    let mounted = true;

    async function loadRuntime() {
      setError(undefined);

      try {
        if (!runtimeCode) {
          throw new Error('Runtime route must include /runtime/:entityCode or /runtime/:pageCode.');
        }

        const rendererContext = {
          tenantId: context.tenantId,
          domainCode: context.domainCode,
          applicationCode: context.applicationCode,
          userId: context.userId,
          roles: context.roles,
          groups: context.groups,
          attributes: context.attributes,
          platform: 'WEB' as const,
        };
        const experience = await resolveRuntimeExperience(runtimeCode, rendererContext);
        const pageCode = experience?.page ?? runtimeCode;
        const [page, theme, navigation] = await Promise.all([
          client.getPage(pageCode),
          client.getTheme(experience?.theme),
          client.getNavigation(experience?.navigation),
        ]);
        const form = page.page.entityCode ? await client.getForm(page.page.entityCode) : undefined;

        if (!mounted) {
          return;
        }

        setState({
          page,
          experience,
          form,
          theme,
          navigation,
        });
        setDocument(form ? createDocumentState(form.sections.flatMap((section) => section.fields)) : { data: {} });
      } catch (loadError) {
        if (mounted) {
          setError(loadError instanceof Error ? loadError.message : String(loadError));
        }
      }
    }

    async function resolveRuntimeExperience(
      entityCode: string,
      rendererContext: {
        tenantId: string;
        domainCode: string;
        applicationCode: string;
        userId: string;
        roles: string[];
        groups: string[];
        attributes: Record<string, unknown>;
        platform: 'WEB';
      },
    ): Promise<RuntimeExperience | undefined> {
      try {
        return await resolveExperienceForRuntime({
          entityCode,
          context: rendererContext,
          resolver: {
            resolveExperience: ({ entityCode: code }) => client.getExperience(code, 'WEB'),
          },
        });
      } catch {
        return undefined;
      }
    }

    void loadRuntime();

    return () => {
      mounted = false;
    };
  }, [client, context, runtimeCode]);

  if (error) {
    return <main className="runtime-card">Runtime metadata load failed: {error}</main>;
  }

  if (!state) {
    return <main className="runtime-card">Loading runtime metadata...</main>;
  }

  const renderContext = {
    client,
    rendererContext: {
      tenantId: context.tenantId,
      domainCode: context.domainCode,
      applicationCode: context.applicationCode,
      userId: context.userId,
      roles: context.roles,
      groups: context.groups,
      attributes: context.attributes,
      platform: 'WEB' as const,
    },
    theme: state.theme,
    navigation: state.navigation,
    form: state.form,
    document,
    setDocument,
    entityCode: state.page.page.entityCode,
    actions: state.page.page.actions ?? [],
  };

  return (
    <ExperienceRuntimeShell>
      <ThemeProvider theme={state.theme}>
        <div className="runtime-shell" data-navigation={state.navigation.layout}>
          <NavigationRenderer navigation={state.navigation} />
          <main className="runtime-main">
            <RuntimeRenderer page={state.page} context={renderContext} />
          </main>
        </div>
      </ThemeProvider>
    </ExperienceRuntimeShell>
  );
}

function runtimeCodeFromLocation(pathname: string): string {
  const [, route, code] = pathname.split('/');
  return route === 'runtime' && code ? code : '';
}
