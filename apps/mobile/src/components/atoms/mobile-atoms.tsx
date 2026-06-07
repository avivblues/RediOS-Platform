import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { bind, bindFormField, resolveAction, type RuntimeNode } from '@redios/runtime-renderer-core';
import { useMobileTheme } from '../../core/theme/theme-provider';
import type { MobileRuntimeRenderContext } from '../../core/adapter/mobile-render-context';
import { activeFieldForNode } from '../../core/adapter/mobile-render-context';

export interface MobileComponentProps {
  node: RuntimeNode;
  context: MobileRuntimeRenderContext;
  children?: ReactNode;
}

export function MobileLabel({ node, context }: MobileComponentProps) {
  const field = activeFieldForNode(context, node.props.fieldCode);
  const { textStyle } = useMobileTheme();
  return <Text style={[styles.label, textStyle]}>{field?.fieldCode ?? String(node.props.label ?? 'Label')}</Text>;
}

export function MobileTextInput({ node, context }: MobileComponentProps) {
  return <BoundTextInput node={node} context={context} keyboardType="default" />;
}

export function MobileNumberInput({ node, context }: MobileComponentProps) {
  return <BoundTextInput node={node} context={context} keyboardType="numeric" numeric />;
}

export function MobileDatePicker({ node, context }: MobileComponentProps) {
  return <BoundTextInput node={node} context={context} keyboardType="default" placeholder="YYYY-MM-DD" />;
}

export function MobileSwitch({ node, context }: MobileComponentProps) {
  const field = activeFieldForNode(context, node.props.fieldCode);
  const binding = node.binding ? bind(context.document, node.binding) : undefined;

  if (!field || !binding) {
    return <Switch disabled />;
  }

  return (
    <Switch
      disabled={field.readonly || node.permissions.disabled}
      value={Boolean(binding.value)}
      onValueChange={(value) => context.setDocument(binding.setValue(value))}
    />
  );
}

export function MobileFileUpload({ node, context }: MobileComponentProps) {
  const field = activeFieldForNode(context, node.props.fieldCode);
  const binding = node.binding ? bind(context.document, node.binding) : undefined;
  const { theme, textStyle } = useMobileTheme();

  return (
    <Pressable
      disabled={!field || field.readonly || !binding}
      style={[styles.button, { backgroundColor: theme.tokens.colors.secondary }]}
      onPress={() => binding && context.setDocument(binding.setValue('FILE_UPLOAD_PENDING'))}
    >
      <Text style={[styles.buttonText, textStyle, { color: theme.tokens.colors.surface }]}>Select File</Text>
    </Pressable>
  );
}

export function MobileLookup({ node, context }: MobileComponentProps) {
  const field = activeFieldForNode(context, node.props.fieldCode);
  const binding = node.binding ? bind(context.document, node.binding) : undefined;
  const [options, setOptions] = useState<Array<{ value: unknown; display: unknown }>>([]);
  const { theme, textStyle } = useMobileTheme();

  async function loadLookup() {
    if (!field?.relation || !field.view) {
      return;
    }

    const result = await context.client.query(field.relation.target, field.view.code);
    setOptions(
      result.data.map((row) => ({
        value: row[field.relation?.valueField ?? 'id'] ?? row.id,
        display: field.relation?.displayField ? row[field.relation.displayField] : Object.values(row).find(Boolean),
      })),
    );
  }

  if (!field || !binding) {
    return <Text style={textStyle}>Lookup unavailable</Text>;
  }

  return (
    <View style={styles.lookup}>
      <Pressable
        disabled={field.readonly || node.permissions.disabled}
        style={[styles.control, { borderColor: theme.tokens.colors.secondary }]}
        onPress={loadLookup}
      >
        <Text style={textStyle}>{String(binding.value || 'Load lookup')}</Text>
      </Pressable>
      {options.map((option) => (
        <Pressable
          key={String(option.value)}
          style={styles.lookupOption}
          onPress={() => context.setDocument(binding.setValue(option.value))}
        >
          <Text style={textStyle}>{String(option.display ?? option.value)}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export function MobileButton({ node, context }: MobileComponentProps) {
  const actionCode = String(node.props.actionCode ?? context.actions[0] ?? '');
  const action = resolveAction({
    node,
    entityCode: context.entityCode,
    document: {
      ...context.document,
      id: context.documentId ?? context.document.id,
    },
    actionCode,
  });
  const { theme, textStyle } = useMobileTheme();

  return (
    <Pressable
      disabled={!action || !action.documentId || node.permissions.disabled}
      style={[styles.button, { backgroundColor: theme.tokens.colors.primary }]}
      onPress={() => {
        if (action?.documentId) {
          if (context.online) {
            void context.client.runAction({
              entityCode: action.entityCode,
              documentId: action.documentId,
              actionCode: action.actionCode,
              data: action.payload,
            });
          } else {
            void context.offlineStore.queueAction({
              entityCode: action.entityCode,
              documentId: action.documentId,
              actionCode: action.actionCode,
              payload: action.payload,
            });
          }
        }
      }}
    >
      <Text style={[styles.buttonText, textStyle, { color: theme.tokens.colors.surface }]}>{action?.actionCode || 'Action'}</Text>
    </Pressable>
  );
}

export function MobileBadge({ context }: MobileComponentProps) {
  const { theme, textStyle } = useMobileTheme();
  return (
    <View style={[styles.badge, { backgroundColor: theme.tokens.colors.background }]}>
      <Text style={textStyle}>{String(context.document.data.status ?? 'STATUS')}</Text>
    </View>
  );
}

export function MobileIcon() {
  const { textStyle } = useMobileTheme();
  return <Text style={textStyle}>*</Text>;
}

function BoundTextInput({
  node,
  context,
  keyboardType,
  numeric,
  placeholder,
}: MobileComponentProps & {
  keyboardType: 'default' | 'numeric';
  numeric?: boolean;
  placeholder?: string;
}) {
  const field = activeFieldForNode(context, node.props.fieldCode);
  const binding = field ? bindFormField(context.document, field) : node.binding ? bind(context.document, node.binding) : undefined;
  const { theme, textStyle } = useMobileTheme();

  return (
    <TextInput
      editable={!field?.readonly && !node.permissions.disabled}
      keyboardType={keyboardType}
      placeholder={placeholder ?? field?.fieldCode}
      style={[styles.control, textStyle, { borderColor: theme.tokens.colors.secondary }]}
      value={binding ? String(binding.value) : ''}
      onChangeText={(value) => {
        if (binding) {
          context.setDocument(binding.setValue(numeric && value !== '' ? Number(value) : value));
        }
      }}
    />
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: 4,
    fontWeight: '600',
  },
  control: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    minHeight: 44,
  },
  lookup: {
    gap: 6,
  },
  lookupOption: {
    paddingVertical: 8,
  },
  button: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '700',
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
});
