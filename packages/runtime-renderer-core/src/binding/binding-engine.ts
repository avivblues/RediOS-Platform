import type { RuntimeDocumentState } from '../context/runtime-context';
import type { RuntimeBinding, RuntimeFormField } from '../renderer/renderer-tree';

export interface BindingController {
  value: unknown;
  setValue: (value: unknown) => RuntimeDocumentState;
}

export function getValue(document: RuntimeDocumentState, binding: RuntimeBinding): unknown {
  if (binding.source === 'FORM') {
    return document.data[binding.fieldCode] ?? '';
  }

  return undefined;
}

export function setValue(document: RuntimeDocumentState, binding: RuntimeBinding, value: unknown): RuntimeDocumentState {
  if (binding.source === 'FORM') {
    return {
      ...document,
      data: {
        ...document.data,
        [binding.fieldCode]: value,
      },
    };
  }

  return document;
}

export function bind(document: RuntimeDocumentState, binding: RuntimeBinding): BindingController {
  return {
    value: getValue(document, binding),
    setValue: (value) => setValue(document, binding, value),
  };
}

export function bindFormField(document: RuntimeDocumentState, field: RuntimeFormField): BindingController {
  return bind(document, bindingFromField(field));
}

export function bindingFromField(field: RuntimeFormField): RuntimeBinding {
  const fieldCode = field.binding?.fieldCode ?? field.fieldCode;

  return {
    source: 'FORM',
    fieldCode,
    path: `document.data.${fieldCode}`,
  };
}

export function createDocumentState(fields: RuntimeFormField[]): RuntimeDocumentState {
  return {
    data: fields.reduce<Record<string, unknown>>((data, field) => {
      data[field.binding?.fieldCode ?? field.fieldCode] = '';
      return data;
    }, {}),
  };
}
