import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { RuntimeNode } from '@redios/runtime-renderer-core';
import type { MobileRuntimeRenderContext } from '../../core/adapter/mobile-render-context';
import { useMobileTheme } from '../../core/theme/theme-provider';
import { MobileButton } from '../atoms/mobile-atoms';

export interface MobileOrganismProps {
  node: RuntimeNode;
  context: MobileRuntimeRenderContext;
  children?: ReactNode;
}

export function MobileFormSection({ children }: MobileOrganismProps) {
  return <View style={styles.section}>{children}</View>;
}

export function MobileDetailCard({ children }: MobileOrganismProps) {
  const { theme } = useMobileTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.tokens.colors.surface }]}>{children}</View>
  );
}

export function MobileActionSheet({ node, context }: MobileOrganismProps) {
  return (
    <View style={styles.actionSheet}>
      {context.actions.map((actionCode) => (
        <MobileButton
          key={actionCode}
          node={{
            ...node,
            component: 'BUTTON',
            props: {
              ...node.props,
              actionCode,
            },
          }}
          context={context}
        />
      ))}
    </View>
  );
}

export function MobileList({ children }: MobileOrganismProps) {
  return <View style={styles.list}>{children}</View>;
}

export function MobileTimeline({ children }: MobileOrganismProps) {
  const { textStyle } = useMobileTheme();
  return (
    <View style={styles.timeline}>
      <Text style={[styles.timelineTitle, textStyle]}>Timeline</Text>
      {children}
    </View>
  );
}

export function MobileNavigationRenderer({ context }: { context: MobileRuntimeRenderContext }) {
  const { theme, textStyle } = useMobileTheme();
  const mode = context.navigation.type === 'MOBILE_TAB' ? 'BOTTOM_TAB' : context.navigation.type === 'SIDEBAR' ? 'DRAWER' : 'STACK';

  return (
    <View style={[styles.navigation, { backgroundColor: theme.tokens.colors.surface }]} accessibilityLabel={mode}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.navigationItems}>
        {context.navigation.items.map((item) => (
          <Pressable key={item.code} style={styles.navigationItem}>
            <Text style={textStyle}>{item.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  actionSheet: {
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 12,
  },
  list: {
    gap: 8,
  },
  timeline: {
    gap: 8,
  },
  timelineTitle: {
    fontWeight: '700',
  },
  navigation: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  navigationItems: {
    gap: 12,
    padding: 12,
  },
  navigationItem: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
});
