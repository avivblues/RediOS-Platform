import type { RuntimeDocumentState, RuntimeFormField } from './runtime-types';

export interface FormBindingController {
  value: unknown;
  update: (value: unknown) => void;
}

export function bindFormField(
  document: RuntimeDocumentState,
  setDocument: (next: RuntimeDocumentState) => void,
  field: RuntimeFormField,
): FormBindingController {
  const fieldCode = field.binding?.fieldCode ?? field.fieldCode;

  return {
    value: document.data[fieldCode] ?? '',
    update: (value) => {
      setDocument({
        ...document,
        data: {
          ...document.data,
          [fieldCode]: value,
        },
      });
    },
  };
}

export function createDocumentFromForm(fields: RuntimeFormField[]): RuntimeDocumentState {
  return {
    data: fields.reduce<Record<string, unknown>>((data, field) => {
      data[field.binding?.fieldCode ?? field.fieldCode] = '';
      return data;
    }, {}),
  };
}
