import { useState } from 'react';
import { bindFormField } from '../../core/renderer/form-binding';
import type { RuntimeComponentProps } from '../../core/renderer/render-context';
import type { QueryResult } from '../../core/renderer/runtime-types';

export function LabelRenderer({ context }: RuntimeComponentProps) {
  return <label>{context.activeField?.fieldCode ?? 'Label'}</label>;
}

export function TextInputRenderer({ context }: RuntimeComponentProps) {
  const field = context.activeField;

  if (!field) {
    return <input className="runtime-control" aria-label="text input" />;
  }

  const binding = bindFormField(context.document, context.setDocument, field);

  return (
    <input
      className="runtime-control"
      aria-label={field.fieldCode}
      disabled={field.readonly}
      value={String(binding.value)}
      onChange={(event) => binding.update(event.target.value)}
    />
  );
}

export function TextAreaRenderer({ context }: RuntimeComponentProps) {
  const field = context.activeField;

  if (!field) {
    return <textarea className="runtime-control" aria-label="text area" />;
  }

  const binding = bindFormField(context.document, context.setDocument, field);

  return (
    <textarea
      className="runtime-control"
      aria-label={field.fieldCode}
      disabled={field.readonly}
      value={String(binding.value)}
      onChange={(event) => binding.update(event.target.value)}
    />
  );
}

export function NumberInputRenderer({ context }: RuntimeComponentProps) {
  const field = context.activeField;

  if (!field) {
    return <input className="runtime-control" type="number" aria-label="number input" />;
  }

  const binding = bindFormField(context.document, context.setDocument, field);

  return (
    <input
      className="runtime-control"
      type="number"
      aria-label={field.fieldCode}
      disabled={field.readonly}
      value={String(binding.value)}
      onChange={(event) => binding.update(event.target.value === '' ? '' : Number(event.target.value))}
    />
  );
}

export function DatePickerRenderer({ context }: RuntimeComponentProps) {
  const field = context.activeField;

  if (!field) {
    return <input className="runtime-control" type="date" aria-label="date picker" />;
  }

  const binding = bindFormField(context.document, context.setDocument, field);

  return (
    <input
      className="runtime-control"
      type="date"
      aria-label={field.fieldCode}
      disabled={field.readonly}
      value={String(binding.value)}
      onChange={(event) => binding.update(event.target.value)}
    />
  );
}

export function SelectRenderer({ context }: RuntimeComponentProps) {
  const field = context.activeField;

  if (!field) {
    return <select className="runtime-control" aria-label="select" />;
  }

  const binding = bindFormField(context.document, context.setDocument, field);

  return (
    <select
      className="runtime-control"
      aria-label={field.fieldCode}
      disabled={field.readonly}
      value={String(binding.value)}
      onChange={(event) => binding.update(event.target.value)}
    >
      <option value="">Select</option>
    </select>
  );
}

export function LookupRenderer({ context }: RuntimeComponentProps) {
  const field = context.activeField;
  const [options, setOptions] = useState<Array<{ value: unknown; display: unknown }>>([]);

  if (!field) {
    return <select className="runtime-control" aria-label="lookup" />;
  }

  const binding = bindFormField(context.document, context.setDocument, field);

  async function loadLookup() {
    if (!field?.relation || !field.view) {
      return;
    }

    const result: QueryResult = await context.client.query(field.relation.target, field.view.code);
    setOptions(
      result.data.map((row) => ({
        value: row[field.relation?.valueField ?? 'id'] ?? row.id,
        display: field.relation?.displayField ? row[field.relation.displayField] : Object.values(row).find(Boolean),
      })),
    );
  }

  return (
    <select
      className="runtime-control"
      aria-label={field.fieldCode}
      disabled={field.readonly}
      value={String(binding.value)}
      onFocus={loadLookup}
      onChange={(event) => binding.update(event.target.value)}
    >
      <option value="">Select</option>
      {options.map((option) => (
        <option key={String(option.value)} value={String(option.value)}>
          {String(option.display ?? option.value)}
        </option>
      ))}
    </select>
  );
}

export function ButtonRenderer({ context }: RuntimeComponentProps) {
  const actionCode = context.actions[0];

  return (
    <button
      className="runtime-button"
      disabled={!actionCode || !context.entityCode || !context.documentId}
      onClick={() => {
        if (actionCode && context.entityCode && context.documentId) {
          void context.client.runAction({
            entityCode: context.entityCode,
            documentId: context.documentId,
            actionCode,
            payload: context.document.data,
          });
        }
      }}
    >
      {actionCode ?? 'Action'}
    </button>
  );
}

export function BadgeRenderer({ context }: RuntimeComponentProps) {
  return <span className="runtime-card">{String(context.document.data.status ?? 'STATUS')}</span>;
}

export function IconRenderer() {
  return <span aria-hidden="true">*</span>;
}
