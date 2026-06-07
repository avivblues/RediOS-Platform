import type { PropsWithChildren } from 'react';
import { Label } from '../atoms/Atoms';

export function FormField({ label, children }: PropsWithChildren<{ label: string }>) {
  return (
    <div className="studio-form-field">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

export function PropertyRow({ name, children }: PropsWithChildren<{ name: string }>) {
  return (
    <div className="studio-property-row">
      <span>{name}</span>
      <div>{children}</div>
    </div>
  );
}
