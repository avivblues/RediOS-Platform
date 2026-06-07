import type { RuntimeComponentProps } from '../../core/renderer/render-context';

export function FormFieldRenderer({ context, children }: RuntimeComponentProps) {
  const field = context.activeField;

  if (!field || !field.visible) {
    return null;
  }

  return (
    <div className="runtime-form-field" data-field={field.fieldCode}>
      {children}
    </div>
  );
}

export function SearchBoxRenderer({ children }: RuntimeComponentProps) {
  return <div className="runtime-form-field">{children}</div>;
}

export function ActionButtonRenderer({ children }: RuntimeComponentProps) {
  return <span>{children}</span>;
}

export function StatusBadgeRenderer({ children }: RuntimeComponentProps) {
  return <span>{children}</span>;
}
