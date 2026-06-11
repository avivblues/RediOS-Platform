import { useEffect, useMemo, useState } from 'react';
import { ThemeProvider } from '../core/theme/theme-provider';
import { createMetadataClient } from '../core/metadata-client/metadata-client';
import { useRuntimeContext } from '../core/context/runtime-context';
import type { ResolvedUIPage, RuntimeForm, RuntimeNavigation, RuntimeTheme } from '../core/renderer/runtime-types';
import { humanizeCode } from '../studio_legacy_phase19/humanizer/HumanizerEngine';
import { RuntimeNavigationRenderer } from './RuntimeNavigationRenderer';
import { RuntimePageRenderer } from './RuntimePageRenderer';

interface RuntimeAppState {
  theme: RuntimeTheme;
  navigation: RuntimeNavigation;
  page?: ResolvedUIPage;
  form?: RuntimeForm;
  activePageCode?: string;
}

export function RuntimeAppShell({ applicationCode }: { applicationCode: string }) {
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
