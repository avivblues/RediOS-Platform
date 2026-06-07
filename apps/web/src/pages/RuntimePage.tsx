import { useEffect, useMemo, useState } from 'react';
import { createMetadataClient } from '../core/metadata-client/metadata-client';
import { createDocumentFromForm } from '../core/renderer/form-binding';
import type {
  ResolvedUIPage,
  RuntimeDocumentState,
  RuntimeForm,
  RuntimeNavigation,
  RuntimeTheme,
} from '../core/renderer/runtime-types';
import { RuntimeRenderer } from '../core/renderer/runtime-renderer';
import { ThemeProvider } from '../core/theme/theme-provider';
import { useRuntimeContext } from '../core/context/runtime-context';
import { NavigationRenderer } from '../components/organisms/navigation/NavigationRenderer';

interface RuntimePageState {
  page: ResolvedUIPage;
  form?: RuntimeForm;
  theme: RuntimeTheme;
  navigation: RuntimeNavigation;
}

export function RuntimePage() {
  const pageCode = pageCodeFromLocation(window.location.pathname);
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
        if (!pageCode) {
          throw new Error('Runtime route must include /runtime/:pageCode.');
        }

        const [page, theme, navigation] = await Promise.all([
          client.getPage(pageCode),
          client.getTheme(),
          client.getNavigation(),
        ]);
        const form = page.page.entityCode ? await client.getForm(page.page.entityCode) : undefined;

        if (!mounted) {
          return;
        }

        setState({
          page,
          form,
          theme,
          navigation,
        });
        setDocument(form ? createDocumentFromForm(form.sections.flatMap((section) => section.fields)) : { data: {} });
      } catch (loadError) {
        if (mounted) {
          setError(loadError instanceof Error ? loadError.message : String(loadError));
        }
      }
    }

    void loadRuntime();

    return () => {
      mounted = false;
    };
  }, [client, pageCode]);

  if (error) {
    return <main className="runtime-card">Runtime metadata load failed: {error}</main>;
  }

  if (!state) {
    return <main className="runtime-card">Loading runtime metadata...</main>;
  }

  const renderContext = {
    client,
    theme: state.theme,
    navigation: state.navigation,
    form: state.form,
    document,
    setDocument,
    entityCode: state.page.page.entityCode,
    actions: state.page.page.actions ?? [],
  };

  return (
    <ThemeProvider theme={state.theme}>
      <div className="runtime-shell" data-navigation={state.navigation.layout}>
        <NavigationRenderer navigation={state.navigation} />
        <main className="runtime-main">
          <RuntimeRenderer page={state.page} context={renderContext} />
        </main>
      </div>
    </ThemeProvider>
  );
}

function pageCodeFromLocation(pathname: string): string {
  const [, route, pageCode] = pathname.split('/');
  return route === 'runtime' && pageCode ? pageCode : '';
}
