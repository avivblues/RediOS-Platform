import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { RuntimeNode } from '@redios/runtime-renderer-core';
import { activeFieldForNode, type MobileRuntimeRenderContext } from '../../core/adapter/mobile-render-context';
import { useMobileTheme } from '../../core/theme/theme-provider';

export interface MobileMoleculeProps {
  node: RuntimeNode;
  context: MobileRuntimeRenderContext;
  children?: ReactNode;
}

export function MobileFormField({ node, context, children }: MobileMoleculeProps) {
  const field = activeFieldForNode(context, node.props.fieldCode);
  const { textStyle } = useMobileTheme();

  if (!node.permissions.visible || field?.visible === false) {
    return null;
  }

  return (
    <View style={styles.field}>
      <Text style={[styles.label, textStyle]}>{field?.fieldCode ?? 'Field'}</Text>
      {children}
    </View>
  );
}

export function MobileActionButton({ children }: MobileMoleculeProps) {
  return <View style={styles.inline}>{children}</View>;
}

export function MobileSearchBox({ children }: MobileMoleculeProps) {
  return <View style={styles.field}>{children}</View>;
}

export function MobileStatusBadge({ children }: MobileMoleculeProps) {
  return <View style={styles.inline}>{children}</View>;
}

const styles = StyleSheet.create({
  field: {
    gap: 6,
    marginBottom: 12,
  },
  label: {
    fontWeight: '600',
  },
  inline: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
});
