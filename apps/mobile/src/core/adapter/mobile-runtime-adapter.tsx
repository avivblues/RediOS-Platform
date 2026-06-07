import type { ReactElement, ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { PlatformAdapter, PlatformRenderContext, RuntimeNode, RuntimeRendererContext } from '@redios/runtime-renderer-core';
import {
  MobileBadge,
  MobileButton,
  MobileDatePicker,
  MobileFileUpload,
  MobileIcon,
  MobileLabel,
  MobileLookup,
  MobileNumberInput,
  MobileSwitch,
  MobileTextInput,
  type MobileComponentProps,
} from '../../components/atoms/mobile-atoms';
import {
  MobileActionButton,
  MobileFormField,
  MobileSearchBox,
  MobileStatusBadge,
} from '../../components/molecules/mobile-molecules';
import {
  MobileActionSheet,
  MobileDetailCard,
  MobileFormSection,
  MobileList,
  MobileTimeline,
} from '../../components/organisms/mobile-organisms';
import type { MobileRuntimeRenderContext } from './mobile-render-context';

type MobileRenderedNode = ReactElement | null;
type MobileRenderer = (props: MobileComponentProps) => MobileRenderedNode;

export class MobileRuntimeAdapter implements PlatformAdapter<MobileRenderedNode> {
  constructor(private readonly runtimeContext: MobileRuntimeRenderContext) {}

  render(node: RuntimeNode, children: MobileRenderedNode[], _context: PlatformRenderContext): MobileRenderedNode {
    if (!node.permissions.visible) {
      return null;
    }

    const Renderer = mobileRegistry[node.component] ?? structuralRegistry[node.kind] ?? MobileContainer;
    return (
      <Renderer key={node.id} node={node} context={this.runtimeContext}>
        {children}
      </Renderer>
    );
  }
}

export function renderMobileRuntimeTree(nodes: RuntimeNode[], context: MobileRuntimeRenderContext): MobileRenderedNode[] {
  const adapter = new MobileRuntimeAdapter(context);
  const platformContext: PlatformRenderContext = {
    rendererContext: context.rendererContext,
  };
  return nodes.map((node) => renderMobileNode(node, adapter, platformContext));
}

export function renderPreview(
  runtimeTree: RuntimeNode[],
  context: MobileRuntimeRenderContext,
  platform: RuntimeRendererContext['platform'] = 'MOBILE',
): MobileRenderedNode[] {
  return renderMobileRuntimeTree(runtimeTree, {
    ...context,
    rendererContext: {
      ...context.rendererContext,
      platform,
    },
  });
}

const mobileRegistry: Record<string, MobileRenderer> = {
  TEXT_INPUT: MobileTextInput,
  TEXT_AREA: MobileTextInput,
  NUMBER_INPUT: MobileNumberInput,
  DATE_PICKER: MobileDatePicker,
  SELECT: MobileTextInput,
  SWITCH: MobileSwitch,
  FILE_UPLOAD: MobileFileUpload,
  BUTTON: MobileButton,
  LABEL: MobileLabel,
  BADGE: MobileBadge,
  ICON: MobileIcon,
  LOOKUP: MobileLookup,
  CARD: MobileContainer,
  TABLE: MobileList,
  FORM_FIELD: MobileFormField,
  SEARCH_BOX: MobileSearchBox,
  ACTION_BUTTON: MobileActionButton,
  STATUS_BADGE: MobileStatusBadge,
  FORM_SECTION: MobileFormSection,
  DETAIL_CARD: MobileDetailCard,
  DATA_TABLE: MobileList,
  TIMELINE: MobileTimeline,
  ACTION_BAR: MobileActionSheet,
  MOBILE_STACK: MobileStackLayout,
  MASTER_DETAIL: MobileStackLayout,
};

const structuralRegistry: Partial<Record<RuntimeNode['kind'], MobileRenderer>> = {
  PAGE: MobileScreenLayout,
  TEMPLATE: MobileStackLayout,
  REGION: MobileRegion,
};

function MobileScreenLayout({ children }: MobileComponentProps) {
  return <View style={styles.screen}>{children}</View>;
}

function MobileStackLayout({ children }: MobileComponentProps) {
  return <ScrollView contentContainerStyle={styles.stack}>{children}</ScrollView>;
}

function MobileRegion({ node, children }: MobileComponentProps) {
  if (node.component === 'HEADER') {
    return <View style={styles.header}>{children}</View>;
  }

  if (node.component === 'ACTION_SHEET') {
    return <View style={styles.actionRegion}>{children}</View>;
  }

  return <View style={styles.region}>{children}</View>;
}

function MobileContainer({ children }: { children?: ReactNode }) {
  return <View style={styles.region}>{children}</View>;
}

function renderMobileNode(
  node: RuntimeNode,
  adapter: MobileRuntimeAdapter,
  context: PlatformRenderContext,
): MobileRenderedNode {
  const children = node.children.map((child) => renderMobileNode(child, adapter, context));
  return adapter.render(node, children, context);
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  stack: {
    gap: 12,
    padding: 16,
  },
  header: {
    gap: 8,
  },
  region: {
    gap: 12,
  },
  actionRegion: {
    marginTop: 'auto',
  },
});
