import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { createDocumentState, generateRuntimeTree, resolveExperienceForRuntime } from '@redios/runtime-renderer-core';
import { renderMobileRuntimeTree } from '../core/adapter/mobile-runtime-adapter';
import type { MobileRuntimeRenderContext } from '../core/adapter/mobile-render-context';
import { createMobileMetadataClient } from '../core/api/mobile-metadata-client';
import type {
  MobileNavigation,
  MobileResolvedUIPage,
  MobileRuntimeForm,
  MobileRuntimeTheme,
  RuntimeDocumentState,
  RuntimeExperience,
} from '../core/api/mobile-runtime-types';
import { useRuntimeContext } from '../core/context/runtime-context';
import { MobileThemeProvider } from '../core/theme/theme-provider';
import { MobileNavigationRenderer } from '../components/organisms/mobile-organisms';
import { SQLiteOfflineStore } from '../core/storage/offline-store';

export interface RuntimeScreenProps {
  entityCode: string;
  debugPageCode?: string;
  documentId?: string;
  online?: boolean;
}

interface RuntimeScreenState {
  experience: RuntimeExperience;
  page: MobileResolvedUIPage;
  form?: MobileRuntimeForm;
  theme: MobileRuntimeTheme;
  navigation: MobileNavigation;
}

export function RuntimeScreen({ entityCode, debugPageCode, documentId, online = true }: RuntimeScreenProps) {
  const { context } = useRuntimeContext();
  const client = useMemo(() => createMobileMetadataClient(context), [context]);
  const offlineStore = useMemo(() => new SQLiteOfflineStore(), []);
  const [state, setState] = useState<RuntimeScreenState | undefined>();
  const [document, setDocument] = useState<RuntimeDocumentState>({ id: documentId, data: {} });
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    let mounted = true;

    async function loadRuntime() {
      setError(undefined);

      try {
        const rendererContext = {
          tenantId: context.tenantId,
          domainCode: context.domainCode,
          applicationCode: context.applicationCode,
          userId: context.userId,
          roles: context.roles,
          groups: context.groups,
          attributes: context.attributes,
          platform: 'MOBILE' as const,
        };
        const experience =
          debugPageCode
            ? debugExperience(entityCode, debugPageCode)
            : await resolveExperienceForRuntime({
                entityCode,
                context: rendererContext,
                resolver: {
                  resolveExperience: ({ entityCode: code }) => client.getExperience(code),
                },
              });
        const [page, theme, navigation] = await Promise.all([
          client.getPage(experience.page),
          client.getTheme(experience.theme),
          client.getNavigation(experience.navigation),
        ]);
        const form = page.page.entityCode ? await client.getForm(page.page.entityCode) : undefined;

        if (!mounted) {
          return;
        }

        setState({
          experience,
          page,
          form,
          theme,
          navigation,
        });
        setDocument({
          ...createDocumentState(form?.sections.flatMap((section) => section.fields) ?? []),
          id: documentId,
        });
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
  }, [client, context, debugPageCode, documentId, entityCode]);

  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text>Mobile runtime metadata load failed: {error}</Text>
      </SafeAreaView>
    );
  }

  if (!state) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator />
        <Text>Loading mobile runtime...</Text>
      </SafeAreaView>
    );
  }

  const renderContext: MobileRuntimeRenderContext = {
    client,
    rendererContext: {
      tenantId: context.tenantId,
      domainCode: context.domainCode,
      applicationCode: context.applicationCode,
      userId: context.userId,
      roles: context.roles,
      groups: context.groups,
      attributes: context.attributes,
      platform: 'MOBILE',
    },
    experience: state.experience,
    theme: state.theme,
    navigation: state.navigation,
    form: state.form,
    document,
    setDocument,
    entityCode: state.page.page.entityCode,
    documentId,
    actions: state.page.page.actions ?? [],
    online,
    offlineStore,
  };
  const runtimeTree = generateRuntimeTree({
    page: state.page,
    form: state.form,
    context: renderContext.rendererContext,
  });

  return (
    <MobileThemeProvider theme={state.theme}>
      <SafeAreaView style={[styles.screen, { backgroundColor: state.theme.tokens.colors.background }]}>
        <View style={styles.content}>{renderMobileRuntimeTree(runtimeTree, renderContext)}</View>
        <MobileNavigationRenderer context={renderContext} />
      </SafeAreaView>
    </MobileThemeProvider>
  );
}

function debugExperience(entityCode: string, pageCode: string): RuntimeExperience {
  return {
    selected: 'DEBUG_EXPERIENCE',
    entityCode,
    platform: 'MOBILE',
    page: pageCode,
    layout: 'MOBILE_STACK',
    interaction: 'TOUCH',
  };
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
});
